const Message = require('../../models/Message');

// Helper to create consistent shared room names
const generateChatRoom = (id1, id2) => {
  return `chat_${[id1, id2].sort().join('_')}`;
};

/**
 * @swagger
 * /api/message/send:
 *   post:
 *     summary: Send a message from any authenticated user to another user
 *     tags:
 *       - Messaging
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - message
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID of the user receiving the message
 *               message:
 *                 type: string
 *                 description: The content of the message
 *     responses:
 *       200:
 *         description: Message successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */

exports.sendMessage = async (req, res) => {
  try {
    const io = req.app.get('io');
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: 'receiverId and message are required' });
    }

    // 1. Create message with status "sent"
    const savedMessage = await Message.create({
      senderId,
      receiverId,
      message,
      status: 'sent',
      timestamp: new Date(),
    });

    // 2. Emit to shared chat room
    const chatRoom = generateChatRoom(senderId, receiverId);
    io.to(chatRoom).emit('message-received', savedMessage);
    console.log(`📢 Emitted message to room: ${chatRoom}`);

    // 3. Update the message to "delivered" after emitting
    savedMessage.status = 'delivered';
    await savedMessage.save();

    return res.status(200).json({ data: savedMessage });
  } catch (err) {
    console.error('❌ sendMessage error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
