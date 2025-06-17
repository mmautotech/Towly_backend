/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get current user's wallet balance
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Wallet balance retrieved
 */
const { Wallet } = require("../../models/finance");

module.exports = async function getWalletBalance(req, res) {
  try {
    const wallet = await Wallet.findOne({ user_id: req.user.id });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    return res.status(200).json(wallet);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch wallet" });
  }
};
