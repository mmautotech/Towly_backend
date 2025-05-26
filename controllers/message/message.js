const Message = require("../../models/Message/Message"); // Adjust path as needed

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const {
      senderId,
      receiverId,
      text,
      userId,
      truckId,
      requestId,
    } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text,
      read: false,
      createdAt: new Date(),
      userId,
      truckId,
      requestId,
    });

    await message.save();
    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error sending message" });
  }
};

// Get all messages for a specific user (sent or received)
exports.getMessagesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages by user:", error);
    res.status(500).json({ error: "Server error fetching messages" });
  }
};

// Mark message as read
exports.markMessageRead = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({ message: "Message marked as read", data: message });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Server error updating message" });
  }
};

// Get conversation between two users
exports.getConversationBetweenUsers = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const conversation = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Server error fetching conversation" });
  }
};

// Get messages by request ID
exports.getMessagesByRequestId = async (req, res) => {
  try {
    const { requestId } = req.params;
    const messages = await Message.find({ requestId }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages by request ID:", error);
    res.status(500).json({ error: "Server error fetching messages by request ID" });
  }
};
