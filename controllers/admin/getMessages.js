const Message = require('../../models/Message');

// Admin: Get full conversation between two users
exports.getConversation = async (req, res) => {
  const { clientId, truckerId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: clientId, receiverId: truckerId },
        { senderId: truckerId, receiverId: clientId },
      ],
      isDeleted: false
    })
    .sort({ timestamp: 1 }); // oldest to newest

    res.status(200).json(messages);
  } catch (error) {
    console.error('Conversation fetch failed:', error);
    res.status(500).json({ message: 'Error fetching conversation' });
  }
};
