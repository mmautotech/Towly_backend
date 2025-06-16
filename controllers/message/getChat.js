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
 *         description: Chat history fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Chat messages retrieved successfully.
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
      return res.status(400).json({
        status: 400,
        message: "Missing required query parameter: otherUserId.",
        data: [],
      });
    }

    const messages = await Message.find({
      isDeleted: false,
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 }); // 🔁 Changed from 1 to -1 for descending order

    res.status(200).json({
      status: 200,
      message: "Chat messages retrieved successfully.",
      data: messages
    });

  } catch (err) {
    console.error("❌ getChat error:", err);
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve chat messages.",
      data: [],
    });
  }
};

module.exports = getChat;
