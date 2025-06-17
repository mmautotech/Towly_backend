const RideRequest = require('../../models/ride-request');
const User = require('../../models/user');

const getAllRideRequest = async (req, res) => {
  try {
    // 1. Total count of ride-requests
    const total = await RideRequest.countDocuments();

    // 2. Fetch all ride-requests with populated user and offer trucker info
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

    res.status(200).json({ total, rideRequests });
  } catch (error) {
    console.error('Error fetching ride requests:', error);
    res.status(500).json({ message: 'Server error while fetching ride requests.' });
  }
};

module.exports = getAllRideRequest;
