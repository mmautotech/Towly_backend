const RideRequest = require("../models/ride-request-model");
const sendSuccessResponse = require("../utils/success-response");

/**
 * @desc    Create a new ride request
 * @route   POST /api/create/ride-request
 * @access  Public
 */
const createRideRequest = async (req, res, next) => {
  try {
    // Ensure default fields if frontend omits them
    req.body.offers ??= [];

    const vehicle = req.body.vehicle_details ?? {};
    vehicle.vehicle_category ??= "donot-apply";
    vehicle.loaded ??= "donot-apply";
    vehicle.Wheels_category ??= "rolling";
    req.body.vehicle_details = vehicle;

    const newRide = new RideRequest(req.body);
    await newRide.save();

    return sendSuccessResponse(res, "Ride request created successfully");
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update ride request status to 'posted'
 * @route   PATCH /api/ride-request/post
 * @access  Public
 */
const postRideRequest = async (req, res, next) => {
  try {
    const { user_id, request_id } = req.body;

    if (!user_id || !request_id) {
      return next(new Error("user_id and request_id are required."));
    }

    const updatedRequest = await RideRequest.findOneAndUpdate(
      { user_id, request_id, status: "created" },
      { status: "posted" },
      { new: true }
    );

    if (!updatedRequest) {
      return next(
        new Error("No matching ride request found or status is not 'created'.")
      );
    }

    return sendSuccessResponse(res, "Ride request status updated to 'posted'.");
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get active ride requests for a user (excluding cleared/cancelled)
 * @route   POST /api/fetch/ride-requests/active
 * @access  Public
 */
const getActiveRideRequestsByUser = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (!user_id || typeof user_id !== "string") {
      return next(new Error("Invalid or missing user_id."));
    }

    const activeRequests = await RideRequest.find({
      user_id,
      status: { $nin: ["cleared", "cancelled"] },
    }).select(
      "request_id status origin_location dest_location vehicle_details"
    );

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

/**
 * @desc    Truck driver adds an offer to a ride request
 * @route   POST /api/ride-request/add-offer
 * @access  Public
 */
const addOfferToRideRequest = async (req, res, next) => {
  try {
    const { request_id, truck_id, offered_price } = req.body;

    if (!request_id || !truck_id || !offered_price) {
      return next(
        new Error("request_id, truck_id, and offered_price are required.")
      );
    }

    const updated = await RideRequest.findOneAndUpdate(
      { request_id },
      {
        $push: {
          offers: {
            truck_id,
            offered_price,
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return next(new Error("Ride request not found."));
    }

    return sendSuccessResponse(res, "Offer added successfully.");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRideRequest,
  getActiveRideRequestsByUser,
  postRideRequest,
  getAllPostedRideRequests,
  addOfferToRideRequest,
};
