/**
 * @swagger
 * /api/message/read/{id}:
 *   patch:
 *     summary: Mark a message as read
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
 *         description: ID of the message to mark as read
 *     responses:
 *       200:
 *         description: Message marked as read
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */

const Message = require("../../models/Message");

const markMessageRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (message.receiverId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to mark this message as read." });
    }

    if (message.status === "read") {
      return res.status(200).json({ message: "Message already marked as read." });
    }

    message.status = "read";
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: message,
    });

  } catch (err) {
    console.error("markMessageRead error:", err);
    res.status(500).json({ error: "Failed to mark message as read." });
  }
};

module.exports = markMessageRead;
