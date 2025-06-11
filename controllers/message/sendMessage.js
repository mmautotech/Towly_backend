/**
 * @swagger
 * /api/message/send:
 *   post:
 *     summary: Send a message to another user
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
 *             properties:
 *               receiverId:
 *                 type: string
 *                 example: "6658f1c4a2a8b9d1a64b1234"
 *               message:
 *                 type: string
 *                 example: "Hi, I need towing help!"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: receiverId and message are required
 *       401:
 *         description: Unauthorized or token missing
 *       500:
 *         description: Failed to send message
 */

const Message = require("../../models/Message");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: "receiverId and message are required." });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      status: 'sent',
    });

    await newMessage.save();

    // Emit via Socket.IO to the receiver's room
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${receiverId}`).emit("new-message", newMessage);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: newMessage,
    });

  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};

module.exports = sendMessage;
