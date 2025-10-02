import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { useMessaging } from '../contexts/MessagingContext'
import apiService from '../services/api'

const Profile = () => {
  const location = useLocation()
  const { user, isAuthenticated, updateUser } = useAuth()
  const { showNotification } = useNotification()
  const { removeFromFavorites } = useFavorites()
  const { 
    conversations, 
    activeConversation, 
    messages, 
    unreadCount,
    loadConversations,
    sendMessage,
    openConversation,
    closeConversation,
    getConversationMessages,
    startTyping,
    stopTyping,
    isTyping
  } = useMessaging()
  
  // Check URL params for initial tab
  const urlParams = new URLSearchParams(location.search)
  const initialTab = urlParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  
  // Ensure user data is available for message comparison
  useEffect(() => {
    if (activeTab === 'messages' && activeConversation && user) {
      // Refresh conversation when user data is available
      openConversation(activeConversation)
    }
  }, [user, activeTab])
  const [userProducts, setUserProducts] = useState([])
  const [userMessages, setUserMessages] = useState([])
  const [userFavorites, setUserFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [newMessageText, setNewMessageText] = useState('')
  const [typingTimeout, setTypingTimeout] = useState(null)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const messagesEndRef = useRef(null)
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || ''
  })

  // Load user data on mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadUserProducts()
      loadUserMessages()
      loadUserFavorites()
    }
  }, [isAuthenticated, user?._id])

  const loadUserProducts = useCallback(async () => {
    setLoading(true)
    try {
      if (user?._id) {
        const response = await apiService.getUserProducts(user._id)
        console.log('User products response:', response)
        // Map the backend product data to match frontend expectations
        const products = (response.products || []).map(product => ({
          id: product._id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
          condition: product.condition,
          status: product.status,
          views: product.views || 0,
          postedDate: product.createdAt,
          image: product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          description: product.description
        }))
        setUserProducts(products)
      } else {
        // No user logged in, set empty array
        setUserProducts([])
      }
    } catch (error) {
      console.error('Error loading user products:', error)
      showNotification('Failed to load your products.', 'error')
      setUserProducts([])
    } finally {
      setLoading(false)
    }
  }, [user?._id, showNotification])

  const loadUserMessages = useCallback(async () => {
    try {
      if (isAuthenticated) {
        await loadConversations()
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      showNotification('Failed to load messages', 'error')
    }
  }, [isAuthenticated, loadConversations, showNotification])

  const loadUserFavorites = useCallback(async () => {
    try {
      if (user?._id) {
        const response = await apiService.getUserFavorites()
        console.log('User favorites response:', response)
        
        // Map the backend product data to match frontend expectations
        const favorites = (response.products || []).map(product => ({
          id: product._id,
          title: product.title,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
          seller: product.seller?.fullName || 'Unknown Seller',
          addedDate: product.createdAt,
          category: product.category,
          condition: product.condition
        }))
        
        setUserFavorites(favorites)
      } else {
        setUserFavorites([])
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
      setUserFavorites([])
    }
  }, [user?._id])

  // Refresh all data
  const refreshData = useCallback(() => {
    if (isAuthenticated && user?._id) {
      loadUserProducts()
      loadUserMessages()
      loadUserFavorites()
    }
  }, [isAuthenticated, user?._id, loadUserProducts, loadUserMessages, loadUserFavorites])

  // Chat functionality
  const openChat = useCallback((message) => {
    setSelectedMessage(message)
    setReplyText('')
  }, [])

  const closeChat = useCallback(() => {
    setSelectedMessage(null)
    setReplyText('')
  }, [])

  const sendReply = useCallback(() => {
    if (!replyText.trim() || !selectedMessage) return

    const conversationId = selectedMessage.conversationId
    const newMessage = {
      id: Date.now(),
      from: user?.fullName || "You",
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
      type: "sent"
    }

    setConversations(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }))

    // Mark message as read
    setUserMessages(prev => 
      prev.map(msg => 
        msg.id === selectedMessage.id ? { ...msg, read: true } : msg
      )
    )

    setReplyText('')
    showNotification('Message sent successfully!', 'success')
  }, [replyText, selectedMessage, user?.fullName, showNotification])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }, [sendReply])

  const formatTime = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }, [])

  const handleProfileUpdate = useCallback(async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!profileData.fullName.trim()) {
      showNotification('Full name is required.', 'error')
      return
    }
    if (!profileData.email.trim()) {
      showNotification('Email is required.', 'error')
      return
    }
    
    try {
      const result = await updateUser(profileData)
      if (result.success) {
        setEditMode(false)
        showNotification('Profile updated successfully!', 'success')
      } else {
        const errorMessage = result.error || result.message || 'Failed to update profile.'
        showNotification(errorMessage, 'error')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile. Please try again.'
      showNotification(errorMessage, 'error')
    }
  }, [profileData, updateUser, showNotification])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleDeleteProduct = useCallback(async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiService.deleteProduct(productId)
      if (response.success) {
        // Remove the product from the local state
        setUserProducts(prev => prev.filter(product => product.id !== productId))
        showNotification('Product deleted successfully!', 'success')
      } else {
        showNotification(response.message || 'Failed to delete product.', 'error')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product. Please try again.'
      showNotification(errorMessage, 'error')
    }
  }, [showNotification])

  const handleRemoveFromFavorites = useCallback(async (productId) => {
    const success = await removeFromFavorites(productId)
    if (success) {
      // Remove from local state immediately for better UX
      setUserFavorites(prev => prev.filter(fav => fav.id !== productId))
    }
  }, [removeFromFavorites])

  // Auto-scroll to bottom when messages change
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      })
    }
  }


  // Only auto-scroll when new messages arrive, not on initial load
  useEffect(() => {
    if (activeConversation) {
      const currentMessages = getConversationMessages(activeConversation.id)
      const currentMessageCount = currentMessages.length
      
      // Only scroll if this is a new message (not initial load) and user hasn't scrolled up
      if (lastMessageCount > 0 && currentMessageCount > lastMessageCount && !isUserScrolledUp) {
        setTimeout(() => scrollToBottom(true), 100) // Small delay for smooth animation
      }
      
      setLastMessageCount(currentMessageCount)
    }
  }, [getConversationMessages(activeConversation?.id || ''), activeConversation, lastMessageCount, isUserScrolledUp])

  // Reset scroll state when conversation changes
  useEffect(() => {
    if (activeConversation) {
      setIsUserScrolledUp(false)
      setLastMessageCount(0)
      // Scroll to bottom on conversation change (without animation for instant load)
      setTimeout(() => scrollToBottom(false), 50)
    }
  }, [activeConversation?.id])

  // Detect when user scrolls up manually
  const handleScroll = (e) => {
    const element = e.target
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50
    setIsUserScrolledUp(!isAtBottom)
  }

  // Messaging functions
  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !activeConversation) return

    try {
      const otherParticipant = activeConversation.otherUser
      await sendMessage(
        activeConversation.id, 
        otherParticipant.id, 
        newMessageText.trim()
      )
      setNewMessageText('')
      
      // Stop typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        setTypingTimeout(null)
      }
      stopTyping(activeConversation.id)
      
      // Scroll to bottom when user sends a message
      setTimeout(() => {
        scrollToBottom(true)
        setIsUserScrolledUp(false)
      }, 100)
      
    } catch (error) {
      console.error('Error sending message:', error)
      showNotification('Failed to send message', 'error')
    }
  }

  const handleTyping = (e) => {
    setNewMessageText(e.target.value)
    
    if (activeConversation) {
      startTyping(activeConversation.id)
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      
      // Set new timeout to stop typing
      const timeout = setTimeout(() => {
        stopTyping(activeConversation.id)
      }, 1000)
      
      setTypingTimeout(timeout)
    }
  }

  const handleMessageKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
      case 'sold':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Sold</span>
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your profile.</p>
          <Link
            to="/login"
            className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hi {user?.fullName?.split(' ')[0]}!</h1>
          <p className="text-gray-600">Manage your account and view your listings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Profile Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-white text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.fullName}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <span className="inline-block mt-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                  {user?.userType?.includes('buyer') && user?.userType?.includes('seller') 
                    ? 'Buyer & Seller' 
                    : user?.userType?.includes('buyer') 
                      ? 'Buyer' 
                      : user?.userType?.includes('seller')
                        ? 'Seller'
                        : 'User'}
                </span>
              </div>

                             {/* Navigation Tabs */}
               <nav className="space-y-2">
                 <button
                   onClick={() => setActiveTab('overview')}
                   className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                     activeTab === 'overview'
                       ? 'bg-purple-600 text-white shadow-md'
                       : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                   }`}
                 >
                   <i className="fas fa-home mr-3"></i>
                   Overview
                 </button>
                 <button
                   onClick={() => setActiveTab('products')}
                   className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                     activeTab === 'products'
                       ? 'bg-purple-600 text-white shadow-md'
                       : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                   }`}
                 >
                   <i className="fas fa-box mr-3"></i>
                   My Products
                 </button>
                 <button
                   onClick={() => setActiveTab('messages')}
                   className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                     activeTab === 'messages'
                       ? 'bg-purple-600 text-white shadow-md'
                       : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                   }`}
                 >
                  <i className="fas fa-envelope mr-3"></i>
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                 </button>
                 <button
                   onClick={() => setActiveTab('favorites')}
                   className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                     activeTab === 'favorites'
                       ? 'bg-purple-600 text-white shadow-md'
                       : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                   }`}
                 >
                   <i className="fas fa-heart mr-3"></i>
                   Favorites
                 </button>
                 <button
                   onClick={() => setActiveTab('settings')}
                   className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                     activeTab === 'settings'
                       ? 'bg-purple-600 text-white shadow-md'
                       : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                   }`}
                 >
                   <i className="fas fa-cog mr-3"></i>
                   Settings
                 </button>
               </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-box text-blue-600"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{userProducts.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-eye text-green-600"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {userProducts.reduce((sum, product) => sum + product.views, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-star text-purple-600"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Rating</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {user?.rating > 0 ? user.rating.toFixed(1) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                                 {/* Recent Activity */}
                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                   {userProducts.length === 0 ? (
                     <div className="text-center py-8">
                       <i className="fas fa-clock text-3xl text-gray-400 mb-3"></i>
                       <p className="text-gray-600">No recent activity</p>
                       <p className="text-sm text-gray-500">Your recent product listings will appear here</p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                       {userProducts.slice(0, 3).map((product) => (
                         <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                           <img
                             src={product.image}
                             alt={product.title}
                             className="w-16 h-16 object-cover rounded-lg"
                             onError={(e) => {
                               e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
                             }}
                           />
                           <div className="flex-1">
                             <h4 className="font-medium text-gray-900">{product.title}</h4>
                             <p className="text-sm text-gray-600">
                               {formatPrice(product.price)} • {product.views} views
                             </p>
                           </div>
                           <div className="text-right">
                             {getStatusBadge(product.status)}
                             <p className="text-xs text-gray-500 mt-1">
                               {new Date(product.postedDate).toLocaleDateString()}
                             </p>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>

                 {/* Quick Actions */}
                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Link
                       to="/sell"
                       className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                     >
                       <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                         <i className="fas fa-plus text-white"></i>
                       </div>
                       <div>
                         <h4 className="font-medium text-gray-900">List New Product</h4>
                         <p className="text-sm text-gray-600">Sell your items</p>
                       </div>
                     </Link>
                     
                     <Link
                       to="/buy"
                       className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                     >
                       <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                         <i className="fas fa-search text-white"></i>
                       </div>
                       <div>
                         <h4 className="font-medium text-gray-900">Browse Products</h4>
                         <p className="text-sm text-gray-600">Find great deals</p>
                       </div>
                     </Link>
                     
                     <button
                       onClick={() => setActiveTab('messages')}
                       className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 text-left"
                     >
                       <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                         <i className="fas fa-envelope text-white"></i>
                       </div>
                       <div>
                         <h4 className="font-medium text-gray-900">View Messages</h4>
                         <p className="text-sm text-gray-600">
                           {userMessages.filter(m => !m.read).length} unread
                         </p>
                       </div>
                     </button>
                     
                     <button
                       onClick={() => setActiveTab('favorites')}
                       className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 text-left"
                     >
                       <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                         <i className="fas fa-heart text-white"></i>
                       </div>
                       <div>
                         <h4 className="font-medium text-gray-900">My Favorites</h4>
                         <p className="text-sm text-gray-600">{userFavorites.length} items</p>
                       </div>
                     </button>
                   </div>
                 </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">My Products</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={refreshData}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      title="Refresh products"
                    >
                      <i className="fas fa-sync-alt mr-2"></i>
                      Refresh
                    </button>
                    <Link
                      to="/sell"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add New Product
                    </Link>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : userProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-box text-4xl text-gray-400 mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
                    <p className="text-gray-600 mb-6">You haven't listed any products for sale yet. Start selling to see them here!</p>
                    <Link
                      to="/sell"
                      className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      List Your First Product
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
                          }}
                        />
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{product.title}</h4>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                            {getStatusBadge(product.status)}
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            <span>{product.views} views</span>
                            <span>{new Date(product.postedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                         )}

             {/* Messages Tab */}
             {activeTab === 'messages' && (
               <div className="space-y-6">
                 <div className="flex justify-between items-center">
                   <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                   {activeConversation && (
                     <button 
                       onClick={closeConversation}
                       className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                     >
                       <i className="fas fa-times mr-2"></i>
                       Close Chat
                     </button>
                   )}
                 </div>

                 {conversations.length === 0 ? (
                   <div className="text-center py-12">
                     <i className="fas fa-envelope text-4xl text-gray-400 mb-4"></i>
                     <h4 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h4>
                     <p className="text-gray-600">You'll see messages from buyers here when they contact you about your products.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Conversations List */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                          <h4 className="font-bold text-gray-900 text-lg flex items-center">
                            <i className="fas fa-comments text-purple-600 mr-3"></i>
                            Conversations
                          </h4>
                        </div>
                        <div className="max-h-[800px] overflow-y-auto">
                          {conversations.map((conversation) => (
                            <div 
                              key={conversation.id} 
                              className={`p-5 border-b border-gray-50 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 ${
                                activeConversation?.id === conversation.id ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-l-purple-500 shadow-md' : ''
                              } ${conversation.unreadCount > 0 ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''}`}
                              onClick={() => openConversation(conversation)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">{conversation.otherUser.name}</h5>
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(conversation.lastActivity)}
                                </span>
                              </div>
                              {conversation.product && (
                                <p className="text-sm text-gray-600 mb-1">Re: {conversation.product.title}</p>
                              )}
                              {conversation.lastMessage && (
                                <p className="text-xs text-gray-500 truncate">{conversation.lastMessage.content}</p>
                              )}
                              <div className="flex justify-between items-center mt-2">
                                {conversation.product && (
                                  <span className="text-xs text-purple-600 font-medium">
                                    ₹{conversation.product.price?.toLocaleString()}
                                  </span>
                                )}
                                {conversation.unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chat Box */}
                    <div className="lg:col-span-2">
                      {activeConversation ? (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-[900px] flex flex-col max-h-[90vh]">
                          {/* Chat Header - Fixed */}
                          <div className="sticky top-0 z-10 p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 flex justify-between items-center backdrop-blur-sm">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {activeConversation.otherUser.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">{activeConversation.otherUser.name}</h4>
                                {activeConversation.product && (
                                  <p className="text-sm text-purple-600 font-medium">💬 About: {activeConversation.product.title}</p>
                                )}
                                <p className="text-xs text-green-500 font-medium">● Online</p>
                              </div>
                            </div>
                            <button 
                              onClick={closeConversation}
                              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
                            >
                              <i className="fas fa-times text-sm"></i>
                            </button>
                          </div>

                          {/* Chat Messages */}
                          <div 
                            className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white relative min-h-0"
                            onScroll={handleScroll}
                          >
                            {getConversationMessages(activeConversation.id).map((message) => {
                              // Ensure we have proper sender information
                              const senderId = message.sender?._id || message.sender?.id || message.sender;
                              const currentUserId = user?._id || user?.id;
                              
                              // More robust message ownership check
                              const isMyMessage = senderId && currentUserId && 
                                (senderId.toString() === currentUserId.toString());
                              
                              // Debug logging (can be removed in production)
                              if (process.env.NODE_ENV === 'development') {
                                console.log('Message debug:', {
                                  messageId: message._id || message.id,
                                  senderId: senderId,
                                  currentUserId: currentUserId,
                                  isMyMessage,
                                  content: message.content?.substring(0, 20) + '...',
                                  senderObject: message.sender
                                });
                              }
                              
                              return (
                                <div 
                                  key={message._id || message.id} 
                                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-sm lg:max-w-lg px-5 py-4 rounded-3xl shadow-md transition-all duration-200 hover:shadow-lg ${
                                    isMyMessage
                                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-lg' 
                                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-lg'
                                  }`}>
                                    {/* Add sender name for clarity (only for other person's messages) */}
                                    {!isMyMessage && (
                                      <p className="text-xs font-medium text-gray-600 mb-1">
                                        {message.sender?.fullName || activeConversation?.otherUser?.name || 'Other User'}
                                      </p>
                                    )}
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                    <div className={`flex items-center justify-between mt-2 text-xs ${
                                      isMyMessage ? 'text-purple-200' : 'text-gray-500'
                                    }`}>
                                      <span>{formatMessageTime(message.createdAt)}</span>
                                      {isMyMessage && (
                                        <div className="ml-2">
                                          {message.isRead ? (
                                            <i className="fas fa-check-double text-purple-200" title="Read"></i>
                                          ) : (
                                            <i className="fas fa-check text-purple-300" title="Sent"></i>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {isTyping(activeConversation.id) && (
                              <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 text-gray-600 px-5 py-4 rounded-3xl rounded-bl-lg shadow-md">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {activeConversation.otherUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 mr-2">is typing</span>
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                            
                            {/* Scroll to bottom button */}
                            {isUserScrolledUp && (
                              <div className="absolute bottom-4 right-4">
                                <button
                                  onClick={() => {
                                    scrollToBottom(true)
                                    setIsUserScrolledUp(false)
                                  }}
                                  className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                                >
                                  <i className="fas fa-chevron-down text-sm"></i>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Message Input - Fixed */}
                          <div className="sticky bottom-0 z-10 p-4 border-t border-gray-100 bg-white backdrop-blur-sm shadow-lg">
                            <div className="flex items-end space-x-4">
                              <div className="flex-1 relative">
                                <textarea
                                  value={newMessageText}
                                  onChange={handleTyping}
                                  onKeyPress={handleMessageKeyPress}
                                  placeholder="Type your message..."
                                  rows={2}
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                                />
                                <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                                  {newMessageText.length}/1000
                                </div>
                              </div>
                              <button
                                onClick={handleSendMessage}
                                disabled={!newMessageText.trim()}
                                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                              >
                                <i className="fas fa-paper-plane text-sm"></i>
                              </button>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <p className="text-xs text-gray-500">
                                Press Enter to send, Shift+Enter for new line
                              </p>
                              <div className="flex space-x-2">
                                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                  <i className="fas fa-smile text-sm"></i>
                                </button>
                                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                  <i className="fas fa-paperclip text-sm"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-[900px] max-h-[90vh] flex items-center justify-center">
                          <div className="text-center">
                            <i className="fas fa-comments text-4xl text-gray-400 mb-4"></i>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h4>
                            <p className="text-gray-600">Choose a message from the list to start chatting</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

             {/* Favorites Tab */}
             {activeTab === 'favorites' && (
               <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-gray-900">My Favorites</h3>

                 {userFavorites.length === 0 ? (
                   <div className="text-center py-12">
                     <i className="fas fa-heart text-4xl text-gray-400 mb-4"></i>
                     <h4 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h4>
                     <p className="text-gray-600">Start browsing products and add them to your favorites to see them here.</p>
                     <Link
                       to="/buy"
                       className="inline-block mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                     >
                       Browse Products
                     </Link>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {userFavorites.map((favorite) => (
                       <div key={favorite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                         <img
                           src={favorite.image}
                           alt={favorite.title}
                           className="w-full h-48 object-cover"
                         />
                         <div className="p-4">
                           <h4 className="font-semibold text-gray-900 mb-2">{favorite.title}</h4>
                           <p className="text-lg font-bold text-gray-900 mb-2">{formatPrice(favorite.price)}</p>
                           <p className="text-sm text-gray-600 mb-3">Seller: {favorite.seller}</p>
                           <div className="flex justify-between items-center">
                             <span className="text-xs text-gray-500">
                               Added {new Date(favorite.addedDate).toLocaleDateString()}
                             </span>
                             <button 
                               onClick={() => handleRemoveFromFavorites(favorite.id)}
                               className="text-red-500 hover:text-red-700 text-sm transition-colors duration-200"
                               title="Remove from favorites"
                             >
                               <i className="fas fa-heart"></i>
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}

             {/* Settings Tab */}
             {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!editMode}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={!editMode}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    {editMode ? (
                      <>
                        <button
                          type="submit"
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMode(false)
                            setProfileData({
                              fullName: user?.fullName || '',
                              email: user?.email || '',
                              phone: user?.phone || '',
                              location: user?.location || '',
                              bio: user?.bio || ''
                            })
                          }}
                          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
