const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // Can be null for general conversations
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Track unread count for each participant
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ product: 1 });

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.toString() === userId.toString()
  );
};

// Method to get other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(participant => 
    participant.toString() !== userId.toString()
  );
};

// Method to update unread count
conversationSchema.methods.updateUnreadCount = function(userId, increment = true) {
  const userIdStr = userId.toString();
  const currentCount = this.unreadCount.get(userIdStr) || 0;
  
  if (increment) {
    this.unreadCount.set(userIdStr, currentCount + 1);
  } else {
    this.unreadCount.set(userIdStr, 0);
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);
