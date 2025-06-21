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
 *         description: Wallet balance retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 wallet:
 *                   type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: Wallet not found
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
    const wallet = await Wallet.findOne({ user_id: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    return res.status(200).json({
      success: true,
      wallet,
      message: "Wallet balance retrieved"
    });
  } catch (err) {
    console.error("Failed to fetch wallet:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet"
    });
  }
};
