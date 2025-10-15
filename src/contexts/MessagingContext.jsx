import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'
import apiService from '../services/api'

const MessagingContext = createContext()

export const useMessaging = () => {
  const context = useContext(MessagingContext)
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider')
  }
  return context
}

export const MessagingProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  
  const [socket, setSocket] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState({}) // { conversationId: [messages] }
  const [unreadCount, setUnreadCount] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [typingUsers, setTypingUsers] = useState({}) // { conversationId: [userIds] }
  const [loading, setLoading] = useState(false)
  
  const socketRef = useRef(null)
  const typingTimeoutRef = useRef({})

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = apiService.getAuthToken()
      if (token) {
        const newSocket = io(import.meta.env.VITE_API_URL || 'https://sellnext.onrender.com', {
          auth: { token }
        })

        newSocket.on('connect', () => {
          console.log('Connected to messaging server')
          setSocket(newSocket)
          socketRef.current = newSocket
        })

        newSocket.on('disconnect', () => {
          console.log('Disconnected from messaging server')
          setSocket(null)
        })

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error)
          showNotification('Failed to connect to messaging service', 'error')
        })

        // Handle real-time messages
        newSocket.on('new_message', (messageData) => {
          handleNewMessage(messageData)
        })

        // Handle message notifications
        newSocket.on('message_notification', (notification) => {
          showNotification(
            `New message from ${notification.senderName}: ${notification.content}`,
            'info'
          )
          setUnreadCount(prev => prev + 1)
        })

        // Handle typing indicators
        newSocket.on('user_typing', (data) => {
          setTypingUsers(prev => ({
            ...prev,
            [activeConversation?.id]: [
              ...(prev[activeConversation?.id] || []).filter(id => id !== data.userId),
              data.userId
            ]
          }))
        })

        newSocket.on('user_stopped_typing', (data) => {
          setTypingUsers(prev => ({
            ...prev,
            [activeConversation?.id]: (prev[activeConversation?.id] || []).filter(id => id !== data.userId)
          }))
        })

        return () => {
          newSocket.disconnect()
        }
      }
    }
  }, [isAuthenticated, user])

  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations()
      loadUnreadCount()
    }
  }, [isAuthenticated])

  const handleNewMessage = (messageData) => {
    const { conversationId, senderId, senderName, content, messageType, timestamp } = messageData
    
    const newMessage = {
      id: Date.now(), // Temporary ID
      _id: `temp_${Date.now()}`, // Add _id for consistency
      conversation: conversationId,
      sender: { 
        _id: senderId, 
        id: senderId, // Add both for compatibility
        fullName: senderName 
      },
      content,
      messageType,
      createdAt: timestamp,
      isRead: false
    }

    // Add message to conversation
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }))

    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              lastMessage: { content, createdAt: timestamp, senderId },
              unreadCount: conv.id === activeConversation?.id ? 0 : (conv.unreadCount || 0) + 1
            }
          : conv
      )
    )
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await apiService.getConversations()
      setConversations(response.conversations || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
      showNotification('Failed to load conversations', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId, forceRefresh = false) => {
    try {
      // Only skip loading if messages exist and we're not forcing refresh
      if (messages[conversationId] && !forceRefresh) return
      
      const response = await apiService.getConversationMessages(conversationId)
      
      // Ensure each message has proper sender information
      const processedMessages = (response.messages || []).map(msg => ({
        ...msg,
        // Ensure sender ID is always available
        sender: {
          ...msg.sender,
          _id: msg.sender?._id || msg.sender?.id || msg.sender
        }
      }))
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: processedMessages
      }))

      // Join conversation room for real-time updates
      if (socket) {
        socket.emit('join_conversation', conversationId)
      }

    } catch (error) {
      console.error('Error loading messages:', error)
      showNotification('Failed to load messages', 'error')
    }
  }

  const sendMessage = async (conversationId, receiverId, content, messageType = 'text') => {
    try {
      // Optimistically add message to UI
      const tempMessage = {
        id: `temp_${Date.now()}`,
        conversation: conversationId,
        sender: { _id: user._id, fullName: user.fullName },
        receiver: { _id: receiverId },
        content,
        messageType,
        createdAt: new Date().toISOString(),
        isRead: false,
        status: 'sending'
      }

      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), tempMessage]
      }))

      // Send via API
      const response = await apiService.sendMessage({
        conversationId,
        receiverId,
        content,
        messageType
      })

      // Replace temp message with real message
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(msg => 
          msg.id === tempMessage.id ? { ...response.message, status: 'sent' } : msg
        )
      }))

      // Send via socket for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          conversationId,
          receiverId,
          content,
          messageType
        })
      }

      return response.message

    } catch (error) {
      console.error('Error sending message:', error)
      showNotification('Failed to send message', 'error')
      
      // Remove failed message
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].filter(msg => msg.id !== `temp_${Date.now()}`)
      }))
      
      throw error
    }
  }

  const createConversation = async (participantId, productId = null) => {
    try {
      const response = await apiService.createConversation({
        participantId,
        productId
      })
      
      // Reload conversations to include new one
      await loadConversations()
      
      return response.conversation

    } catch (error) {
      console.error('Error creating conversation:', error)
      showNotification('Failed to start conversation', 'error')
      throw error
    }
  }

  const markAsRead = async (conversationId) => {
    try {
      // Update UI immediately
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )

      // Update messages
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(msg => ({
          ...msg,
          isRead: msg.receiver?._id === user._id ? true : msg.isRead
        }))
      }))

      // Update unread count
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation?.unreadCount > 0) {
        setUnreadCount(prev => Math.max(0, prev - conversation.unreadCount))
      }

    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadCount()
      setUnreadCount(response.unreadCount || 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const startTyping = (conversationId) => {
    if (socket && activeConversation?.id === conversationId) {
      socket.emit('typing_start', { conversationId })
      
      // Clear existing timeout
      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId])
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current[conversationId] = setTimeout(() => {
        stopTyping(conversationId)
      }, 3000)
    }
  }

  const stopTyping = (conversationId) => {
    if (socket) {
      socket.emit('typing_stop', { conversationId })
    }
    
    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId])
      delete typingTimeoutRef.current[conversationId]
    }
  }

  const openConversation = async (conversation) => {
    setActiveConversation(conversation)
    // Force refresh messages to ensure latest data and proper sender info
    await loadMessages(conversation.id, true)
    await markAsRead(conversation.id)
  }

  const closeConversation = () => {
    if (activeConversation && socket) {
      socket.emit('leave_conversation', activeConversation.id)
      stopTyping(activeConversation.id)
    }
    setActiveConversation(null)
  }

  const value = {
    // State
    conversations,
    activeConversation,
    messages,
    unreadCount,
    onlineUsers,
    typingUsers,
    loading,
    socket,
    
    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    markAsRead,
    startTyping,
    stopTyping,
    openConversation,
    closeConversation,
    
    // Helpers
    getConversationMessages: (conversationId) => messages[conversationId] || [],
    isTyping: (conversationId) => (typingUsers[conversationId] || []).length > 0
  }

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  )
}

export default MessagingContext
