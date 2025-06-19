const { User } = require('../../models');
const { Wallet, Transaction } = require('../../models/finance');

/**
 * @swagger
 * /user_profiles/stats:
 *   get:
 *     summary: Get platform-wide statistics (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalClients:
 *                   type: integer
 *                 totalTruckers:
 *                   type: integer
 *                 totalWalletAccounts:
 *                   type: integer
 *                 totalBalance:
 *                   type: number
 *                 confirmedTransactions:
 *                   type: integer
 *                 pendingTransactions:
 *                   type: integer
 *                 cancelledTransactions:
 *                   type: integer
 *       500:
 *         description: Server error
 */
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalTruckers,
      totalWalletAccounts,
      confirmedTransactions,
      pendingTransactions,
      cancelledTransactions,
      walletAggregation
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'truck' }),
      Wallet.countDocuments(),
      Transaction.countDocuments({ status: 'confirmed' }),
      Transaction.countDocuments({ status: 'pending' }),
      Transaction.countDocuments({ status: 'cancelled' }),
      Wallet.aggregate([
        { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
      ])
    ]);

    const totalBalance = walletAggregation[0]?.totalBalance || 0;

    res.status(200).json({
      totalUsers,
      totalClients,
      totalTruckers,
      totalWalletAccounts,
      totalBalance,
      confirmedTransactions,
      pendingTransactions,
      cancelledTransactions
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getStats;