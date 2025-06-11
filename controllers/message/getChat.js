/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get chat history between two users
 *     tags:
 *       - Messaging
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the other user in the conversation
 *     responses:
 *       200:
 *         description: Returns list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing otherUserId query param
 *       500:
 *         description: Server error
 */

const Message = require("../../models/Message");

const getChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.query;

    if (!otherUserId) {
      return res.status(400).json({ error: "otherUserId query param is required." });
    }

    const messages = await Message.find({
      isDeleted: false,
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (err) {
    console.error("getChat error:", err);
    res.status(500).json({ error: "Failed to retrieve chat messages." });
  }
};

module.exports = getChat;
