const { RideRequest, User } = require("../../models");

/**
 * @swagger
 * /ride-requests/getAll:
 *   get:
 *     summary: Get paginated ride requests with filters (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of items per page (default 5)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, posted, accepted, completed, cancelled, All]
 *         description: Filter by request status
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         description: Filter by client user name (partial match, case-insensitive)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort by creation date (default desc)
 *     responses:
 *       200:
 *         description: Ride requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 rideRequests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user_id:
 *                         type: object
 *                         properties:
 *                           user_name:
 *                             type: string
 *                           phone:
 *                             type: string
 *                       offers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             offered_price:
 *                               type: number
 *                             time_to_reach:
 *                               type: string
 *                             truck_id:
 *                               type: object
 *                               properties:
 *                                 user_name:
 *                                   type: string
 *                                 phone:
 *                                   type: string
 *       403:
 *         description: Forbidden, only admin can access
 *       500:
 *         description: Server error
 */
const getAllRideRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admins only.",
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 5);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const userName = req.query.userName;
    const sortOrder = req.query.sort === "asc" ? 1 : -1;

    const filters = {};
    if (status && status !== "All") {
      filters.status = status;
    }

    if (userName) {
      const matchingUsers = await User.find({
        user_name: { $regex: userName, $options: "i" },
      }).select("_id");
      filters.user_id = { $in: matchingUsers.map((u) => u._id) };
    }

    const total = await RideRequest.countDocuments(filters);

    const rideRequests = await RideRequest.find(filters)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user_id",
        select: "user_name phone",
        model: User,
      })
      .populate({
        path: "offers.truck_id",
        select: "user_name phone",
        model: User,
      })
      .lean();

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      rideRequests,
    });
  } catch (error) {
    console.error("Error fetching ride requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching ride requests.",
    });
  }
};

module.exports = getAllRideRequest;
