const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    required: false,
  },
  truckId: {
    type: String,
    required: false,
  },
  requestId: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
