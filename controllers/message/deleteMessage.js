/**
 * @swagger
 * /api/message/delete/{id}:
 *   patch:
 *     summary: Soft delete a message
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
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */

const Message = require("../../models/Message");

const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this message." });
    }

    if (message.isDeleted) {
      return res.status(200).json({ message: "Message already deleted." });
    }

    message.isDeleted = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });

  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ error: "Failed to delete message." });
  }
};

module.exports = deleteMessage;
