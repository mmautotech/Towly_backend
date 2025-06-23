const { Transaction } = require("../../models/finance");

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get current truck user's transaction history with filters, pagination, and log details (with user names in log)
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
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: Filtered and paginated truck user's transactions (descending by date)
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       remarks:
 *                         type: string
 *                       proof_details:
 *                         type: string
 *                       balanceAfter:
 *                         type: number
 *                       log:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             action:
 *                               type: string
 *                             by:
 *                               type: string
 *                               description: Name or email of the user who performed the action
 *                             note:
 *                               type: string
 *                             at:
 *                               type: string
 *                               format: date-time
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
    // Defensive: Ensure truck user
    if (!req.user || req.user.role !== "truck") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Truck users only.",
      });
    }

    const userId = req.user.id;
    const { status, from, to, page = 1, limit = 20 } = req.query;

    // Date range validation
    let fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    let toDate = new Date();
    if (from && !isNaN(Date.parse(from))) fromDate = new Date(from);
    if (to && !isNaN(Date.parse(to))) toDate = new Date(to);

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);

    const query = {
      user_id: userId,
      createdAt: { $gte: fromDate, $lte: toDate },
    };
    if (status && ["pending", "confirmed", "cancelled"].includes(status)) {
      query.status = status;
    }

    // Descending order by date (newest first)
    const skip = (parsedPage - 1) * parsedLimit;

    // Populate log.by (the user)
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .select("_id amount type status createdAt remarks proof_details balanceAfter log")
        .populate({
          path: "log.by",
          select: "name email",
        })
        .lean(),
      Transaction.countDocuments(query),
    ]);

    // Transform log[].by to user name or email
    const transactionsWithLogNames = transactions.map(tx => ({
      ...tx,
      log: Array.isArray(tx.log)
        ? tx.log.map(l => ({
            ...l,
            by: l.by
              ? (l.by.name || l.by.email || String(l.by))
              : "",
          }))
        : [],
    }));

    return res.status(200).json({
      success: true,
      page: parsedPage,
      limit: parsedLimit,
      total,
      transactions: transactionsWithLogNames,
      message: "Truck user's transactions fetched successfully (newest first)",
    });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};
