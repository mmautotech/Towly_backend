const { User } = require('../../models');
const mongoose = require("mongoose");

/**
 * @swagger
 * /block/{userId}:
 *   patch:
 *     summary: Block or unblock a user
 *     description: Allows an admin to update a user's status to either "blocked" or "active".
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *       - in: body
 *         name: status
 *         description: New status for the user
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - status
 *           properties:
 *             status:
 *               type: string
 *               enum: [blocked, active]
 *               example: blocked
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Invalid input or status
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not an admin)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const updateStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!["blocked", "active"].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Use "blocked" or "active".' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[${new Date().toISOString()}] ❌ User not found: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    console.log(`[${new Date().toISOString()}] ✅ Admin ${req.user?.id} updated status of user ${userId}`);
    console.log(`↪️  Status changed from "${previousStatus}" to "${status}"`);

    return res.status(200).json({
      success: true,
      message: `User ${status} successfully.`,
      userId: user._id,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error updating user status:`, error);
    return res.status(500).json({ message: "Server error while updating user status." });
  }
};

module.exports = updateStatus;
