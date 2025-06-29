const Message = require('../../models/Message');

// Helper to create consistent shared room names
const generateChatRoom = (id1, id2) => {
  return `chat_${[id1, id2].sort().join('_')}`;
};

/**
 * POST /api/message/send
 */
exports.sendMessage = async (req, res) => {
  try {
    const io = req.app.get('io');
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: 'receiverId and message are required' });
    }

    // 1. Save the message with status "sent"
    const savedMessage = await Message.create({
      senderId,
      receiverId,
      message,
      status: 'sent',
      timestamp: new Date(),
    });

    const chatRoom = generateChatRoom(senderId, receiverId);

    // 2. Emit message to the chat room
    io.to(chatRoom).emit('message-received', savedMessage);
    console.log(`📢 Emitted message to room: ${chatRoom}`);

    // 3. Update the status to "delivered"
    savedMessage.status = 'delivered';
    await savedMessage.save();

    // 4. Count unread messages from sender to receiver
    const unreadCount = await Message.countDocuments({
      receiverId,
      senderId,
      status: { $ne: 'read' },
    });

    // 5. Emit unread count update to receiver
    const notificationPayload = {
      receiverId,
      senderId,
      senderName: req.user.user_name,
      message,
      timestamp: savedMessage.timestamp,
      count: unreadCount,
    };

    console.log('📨 Emitting message:received payload to user_' + receiverId, notificationPayload);

    io.to(`user_${receiverId}`).emit('message:received', notificationPayload);

    return res.status(200).json({
      data: savedMessage,
      unreadCount,
    });
  } catch (err) {
    console.error('❌ sendMessage error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
