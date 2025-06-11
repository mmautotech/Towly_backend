const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
});

// 📌 Compound index for efficient chat queries
MessageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });

// 📌 Index for quick lookup of unread messages
MessageSchema.index({ receiverId: 1, status: 1 });

// 📌 Index for finding deleted messages (if needed)
MessageSchema.index({ senderId: 1, isDeleted: 1 });

module.exports = MessageSchema;
