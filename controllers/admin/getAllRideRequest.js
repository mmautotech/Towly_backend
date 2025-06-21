const { RideRequest, User } = require('../../models');

/**
 * @swagger
 * /ride-requests/getAll:
 *   get:
 *     summary: Get all ride requests with user and truck info (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ride requests retrieved successfully
 *       403:
 *         description: Forbidden, only admin can access
 *       500:
 *         description: Server error
 */
const getAllRideRequest = async (req, res) => {
  try {
    // Defensive: Confirm current user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admins only.',
      });
    }

    const total = await RideRequest.countDocuments();
    const rideRequests = await RideRequest
      .find({})
      .sort({ createdAt: -1 })
      .populate({
        path: 'user_id',
        select: 'user_name phone',
        model: User,
      })
      .populate({
        path: 'offers.truck_id',
        select: 'user_name phone',
        model: User,
      })
      .lean();

    res.status(200).json({
      success: true,
      total,
      rideRequests,
    });
  } catch (error) {
    console.error('Error fetching ride requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ride requests.',
    });
  }
};

module.exports = getAllRideRequest;
