/**
 * @swagger
 * /api/message/read/{id}:
 *   patch:
 *     summary: Mark all messages from a sender as read by the receiver
 *     tags:
 *       - Messaging
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sender's user ID whose messages should be marked as read
 *     responses:
 *       200:
 *         description: Messages marked as read
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
 *                   example: 4 messages marked as read.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 message:
 *                   type: string
 *                   example: Failed to mark messages as read.
 */

const Message = require("../../models/Message");

const markMessageRead = async (req, res) => {
  try {
    const senderId = req.params.id;
    const receiverId = req.user.id;

    // Find all messages from sender to receiver that are not already marked as 'read'
    const result = await Message.updateMany(
      {
        senderId,
        receiverId,
        status: { $ne: "read" },
      },
      { $set: { status: "read" } }
    );

    res.status(200).json({
      status: 200,
      message: `${result.modifiedCount} message(s) marked as read.`,
    });
  } catch (error) {
    console.error("markMessageRead error:", error);
    res.status(500).json({
      status: 500,
      message: "Failed to mark messages as read.",
    });
  }
};

module.exports = markMessageRead;
