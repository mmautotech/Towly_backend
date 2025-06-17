/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get current user's transaction history
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: List of user transactions
 */
const { Transaction } = require("../../models/finance");

module.exports = async function getTransactionLog(req, res) {
  try {
    const transactions = await Transaction.find({ user_id: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
