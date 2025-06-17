/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     summary: Admin gets all transactions
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: All transaction records
 */
const { Transaction } = require("../../models/finance");

module.exports = async function getAllTransactions(req, res) {
  try {
    const transactions = await Transaction.find()
      .populate("user_id", "user_name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};