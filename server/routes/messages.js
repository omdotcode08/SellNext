const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Product = require('../models/Product');

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'fullName email avatar')
    .populate('product', 'title images price')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      
      return {
        id: conv._id,
        otherUser: {
          id: otherParticipant._id,
          name: otherParticipant.fullName,
          avatar: otherParticipant.avatar
        },
        product: conv.product ? {
          id: conv.product._id,
          title: conv.product.title,
          image: conv.product.images[0],
          price: conv.product.price
        } : null,
        lastMessage: conv.lastMessage ? {
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          senderId: conv.lastMessage.sender
        } : null,
        unreadCount: conv.unreadCount.get(req.user._id.toString()) || 0,
        lastActivity: conv.lastActivity
      };
    });

    res.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// @route   GET /api/messages/conversations/:conversationId
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages with pagination
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName avatar')
      .populate('receiver', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.markConversationAsRead(conversationId, req.user._id);
    
    // Reset unread count for this user
    conversation.updateUnreadCount(req.user._id, false);
    await conversation.save();

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// @route   POST /api/messages/conversations
// @desc    Create or get existing conversation
// @access  Private
router.post('/conversations', auth, async (req, res) => {
  try {
    const { participantId, productId } = req.body;

    // Validate participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      product: productId || null
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user._id, participantId],
        product: productId || null
      });
      
      // Initialize unread counts
      conversation.unreadCount.set(req.user._id.toString(), 0);
      conversation.unreadCount.set(participantId.toString(), 0);
      
      await conversation.save();
    }

    // Populate conversation data
    await conversation.populate('participants', 'fullName email avatar');
    if (productId) {
      await conversation.populate('product', 'title images price');
    }

    res.json({
      success: true,
      conversation: {
        id: conversation._id,
        participants: conversation.participants,
        product: conversation.product
      }
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, receiverId, content, messageType = 'text' } = req.body;

    // Validate conversation and user access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content,
      messageType
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    conversation.updateUnreadCount(receiverId, true);
    await conversation.save();

    // Populate message data
    await message.populate('sender', 'fullName avatar');
    await message.populate('receiver', 'fullName avatar');

    res.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get unread message count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

module.exports = router;
