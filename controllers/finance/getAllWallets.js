/**
 * @swagger
 * /admin/wallets:
 *   get:
 *     summary: Admin gets list of all wallets
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: List of all user wallets
 */
const { Wallet } = require("../../models/finance");

module.exports = async function getAllWallets(req, res) {
  try {
    const wallets = await Wallet.find().populate("user_id", "user_name email phone role");
    return res.status(200).json(wallets);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch wallets" });
  }
};
