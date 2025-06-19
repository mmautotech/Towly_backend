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
 *     responses:
 *       200:
 *         description: Wallet(s) retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 wallets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       balance:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       user_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           user_name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           role:
 *                             type: string
 *                       last_transaction:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid user_id
 *       500:
 *         description: Server error
 */

const mongoose = require("mongoose");
const Wallet = require("../../models/finance/wallet.schema");

module.exports = async function getWallets(req, res) {
  try {
    const { user_id } = req.query;

    // Build query filter
    const filter = {};
    if (user_id) {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user_id format",
        });
      }
      filter.user_id = user_id;
    }

    // Fetch wallets with most recently updated first
    const wallets = await Wallet.find(filter)
      .populate("user_id", "user_name email phone role")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: wallets.length,
      wallets,
    });
  } catch (err) {
    console.error("Error fetching wallets:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch wallets" });
  }
};
