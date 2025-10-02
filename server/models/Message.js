const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'offer', 'system'],
    default: 'text'
  },
  readAt: {
    type: Date,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  // For offer messages
  offerData: {
    amount: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    }
  },
  // For image messages
  imageUrl: {
    type: String
  },
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.status = 'read';
  return this.save();
};

// Static method to mark multiple messages as read
messageSchema.statics.markConversationAsRead = function(conversationId, userId) {
  return this.updateMany(
    { 
      conversation: conversationId, 
      receiver: userId, 
      isRead: false 
    },
    { 
      isRead: true, 
      readAt: new Date(),
      status: 'read'
    }
  );
};

module.exports = mongoose.model('Message', messageSchema);
