const { RideRequest, User } = require("../../models");

const rideRequestProjection = {
  _id: 1,
  status: 1,
  createdAt: 1,
  origin_location: 1,
  dest_location: 1,
  vehicle_details: 1,
  accepted_offer: 1,
  user_id: 1,
  offers: 1
};

const getAllRideRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only." });
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Filters
    const { status, userName, sort } = req.query;
    const sortOrder = sort === "asc" ? 1 : -1;
    const filters = {};

    if (status && status !== "All") {
      filters.status = status;
    }

    // Filter by userName
    if (userName) {
      const matchedUserIds = await User.find(
        { user_name: { $regex: userName, $options: "i" } },
        { _id: 1 }
      ).lean();

      if (!matchedUserIds.length) {
        return res.status(200).json({ success: true, total: 0, page, limit, rideRequests: [] });
      }

      filters.user_id = { $in: matchedUserIds.map(user => user._id) };
    }

    // Parallel DB Queries
    const [rideRequests, total] = await Promise.all([
      RideRequest.find(filters, rideRequestProjection)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "user_id",
          select: "user_name phone -_id", // exclude _id if not needed
          model: User
        })
        .populate({
          path: "offers.truck_id",
          select: "user_name phone -_id",
          model: User
        })
        .lean(),
      RideRequest.countDocuments(filters)
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      rideRequests,
    });

  } catch (error) {
    console.error("Error fetching ride requests:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching ride requests.",
    });
  }
};

module.exports = getAllRideRequest;
