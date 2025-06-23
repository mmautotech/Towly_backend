const mongoose = require("mongoose");
const Transaction = require("../../models/finance/transaction.schema");

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     summary: Admin gets all or filtered transactions
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Optional user ID to filter transactions
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Transactions per page (default 10)
 *     responses:
 *       200:
 *         description: Transaction records fetched successfully
 *       400:
 *         description: Invalid user_id
 *       403:
 *         description: Forbidden, only admin can access
 *       500:
 *         description: Server error
 */

module.exports = async function getTransactions(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only." });
    }

    const { user_id } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (user_id) {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({ message: "Invalid user_id format" });
      }
      filter.user_id = user_id;
    }

    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .populate({
        path: "user_id",
        select: "user_name email phone role",
      })
      .populate({
        path: "wallet_id",
        select: "balance currency",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      total,
      page,
      limit,
      transactions,
    });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch transactions" });
  }
};
