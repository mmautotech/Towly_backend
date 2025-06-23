const { Wallet } = require("../../models/finance");

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get current user's wallet balance (truck only)
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 balance:
 *                   type: number
 *                 last_transaction:
 *                   type: string
 *                   description: ObjectId of the last transaction
 *                 message:
 *                   type: string
 *       404:
 *         description: Wallet not found for user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to fetch wallet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

module.exports = async function getWalletBalanceByUser(req, res) {
  try {
    // Only fetch wallet belonging to authenticated user
    const wallet = await Wallet.findOne({ user_id: req.user.id }).lean();
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user.",
      });
    }

    // Respond with only the needed fields for security & clarity
    return res.status(200).json({
      success: true,
      balance: wallet.balance || 0,
      message: "Wallet balance retrieved successfully",
      last_transaction: wallet.last_transaction || null,
    });
  } catch (err) {
    console.error("Failed to fetch wallet balance:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet balance. Please try again.",
    });
  }
};
