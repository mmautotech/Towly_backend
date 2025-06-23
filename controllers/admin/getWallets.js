const mongoose = require("mongoose");
const Wallet = require("../../models/finance/wallet.schema");

/**
 * @swagger
 * /admin/wallets:
 *   get:
 *     summary: Admin gets all wallets or a specific wallet using user_id
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Optional user ID to get wallet for specific user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of wallets per page (default 10)
 *     responses:
 *       200:
 *         description: Wallet(s) retrieved successfully
 *       400:
 *         description: Invalid user_id
 *       403:
 *         description: Forbidden, only admin can access
 *       500:
 *         description: Server error
 */

module.exports = async function getWallets(req, res) {
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

    const total = await Wallet.countDocuments(filter);

    const wallets = await Wallet.find(filter)
      .populate("user_id", "user_name email phone role")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      total,
      page,
      limit,
      wallets,
    });
  } catch (err) {
    console.error("Error fetching wallets:", err);
    return res.status(500).json({ message: "Failed to fetch wallets" });
  }
};
