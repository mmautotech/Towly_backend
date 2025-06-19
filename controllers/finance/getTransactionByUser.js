/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get current user's transaction history with filters and pagination
 *     tags: [Finance]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: Optional status filter
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD (default: 30 days ago)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD (default: today)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Filtered and paginated user transactions
 */
const { Transaction } = require("../../models/finance");

module.exports = async function getTransactionByUser(req, res) {
  try {
    const userId = req.user.id;
    const {
      status,
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { user_id: userId };

    // Optional status filter
    if (status && ["pending", "confirmed", "cancelled"].includes(status)) {
      query.status = status;
    }

    // Date range filter
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const toDate = to ? new Date(to) : new Date();

    query.createdAt = { $gte: fromDate, $lte: toDate };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      transactions,
    });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  }
};
