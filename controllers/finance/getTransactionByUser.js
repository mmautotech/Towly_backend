const { Transaction } = require("../../models/finance");

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get current truck user's transaction history with filters and pagination
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
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
 *         description: Filtered and paginated truck user's transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 transactions:
 *                   type: array
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - only truck users allowed
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
 *         description: Failed to fetch transactions
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

module.exports = async function getTransactionByUser(req, res) {
  try {
    // Ensure user is truck (in practice, use isTruck middleware in router)
    if (!req.user || req.user.role !== "truck") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Truck users only."
      });
    }

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
      message: "Truck user's transactions fetched successfully"
    });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions"
    });
  }
};
