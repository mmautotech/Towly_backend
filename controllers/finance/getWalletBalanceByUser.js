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
    // Try to find an existing wallet document
    let wallet = await Wallet.findOne({ user_id: req.user.id }).lean();

    // If no wallet exists, create one (letting schema defaults apply)
    if (!wallet) {
      const created = await Wallet.create({ user_id: req.user.id });
      // use .toObject() so we can destructure
      wallet = created.toObject();
    }

    return res.status(200).json({
      success: true,
      balance: wallet.balance,
      last_transaction: wallet.last_transaction || null,
      message: "Wallet balance retrieved successfully",
    });
  } catch (err) {
    console.error("Failed to fetch wallet balance:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet balance. Please try again.",
    });
  }
};
