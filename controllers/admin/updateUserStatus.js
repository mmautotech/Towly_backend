const { User } = require('../../models');

/**
 * @swagger
 * /block/{userId}:
 *   patch:
 *     summary: Block or unblock a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [blocked, active]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!["blocked", "active"].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Use "blocked" or "active".' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${status} successfully.`,
      userId: user._id,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: "Server error while updating user status." });
  }
};

module.exports = updateUserStatus;