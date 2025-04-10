const RideRequest = require("../models/ride-request-model");
const sendSuccessResponse = require("../utils/success-response");

/**
 * @desc    Create a new ride request
 * @route   POST /api/create/ride-request
 * @access  Public
 */
const createRideRequest = async (req, res, next) => {
  try {
    const newRide = new RideRequest(req.body);
    await newRide.save();

    return sendSuccessResponse(res, "Ride request created successfully");
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Change status from 'created' to 'posted' using user_id and request_id
 * @route   PATCH /api/ride-request/post
 * @access  Public
 */
const postRideRequest = async (req, res, next) => {
  try {
    const { user_id, request_id } = req.body;

    if (!user_id || !request_id) {
      const error = new Error("user_id and request_id are required.");
      error.statusCode = 400;
      return next(error);
    }

    const updatedRequest = await RideRequest.findOneAndUpdate(
      { user_id, request_id, status: "created" }, // only update if it's currently "created"
      { status: "posted" },
      { new: true }
    );

    if (!updatedRequest) {
      const error = new Error(
        "No matching ride request found or status is not 'created'."
      );
      error.statusCode = 404;
      return next(error);
    }

    return sendSuccessResponse(res, "Ride request status updated to 'posted'.");
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all ride requests by user_id excluding 'cleared' and 'cancelled'
 * @route   POST /api/fetch/ride-requests/active
 * @access  Public
 */
const getActiveRideRequestsByUser = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (!user_id || typeof user_id !== "string") {
      const error = new Error("Invalid or missing user_id.");
      error.statusCode = 400;
      return next(error);
    }

    const activeRequests = await RideRequest.find({
      user_id,
      status: { $nin: ["cleared", "cancelled"] },
    }).select("request_id status pickupLocation destLocation vehicle_details");

    return sendSuccessResponse(
      res,
      "Active ride requests retrieved successfully",
      activeRequests
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get all ride requests with status 'posted'
 * @route   GET /api/ride-requests/posted
 * @access  Public
 */
const getAllPostedRideRequests = async (req, res, next) => {
  try {
    const postedRequests = await RideRequest.find({ status: "posted" }).select(
      "request_id status origin_location dest_location vehicle_details"
    );

    return sendSuccessResponse(
      res,
      "All posted ride requests retrieved successfully",
      postedRequests
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRideRequest,
  getActiveRideRequestsByUser,
  postRideRequest,
  getAllPostedRideRequests,
};
