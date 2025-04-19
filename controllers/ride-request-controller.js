const mongoose = require("mongoose");
const RideRequest = require("../models/ride-request-model");
const sendSuccessResponse = require("../utils/success-response");

/**
 * @desc Create a new ride request
 * @route POST /api/create/ride-request
 */
const createRideRequest = async (req, res, next) => {
  try {
    req.body.offers ??= [];

    const vehicle = req.body.vehicle_details ?? {};
    vehicle.vehicle_category ??= "donot-apply";
    vehicle.loaded ??= "donot-apply";
    vehicle.Wheels_category ??= "rolling";
    req.body.vehicle_details = vehicle;

    // Convert string ID to ObjectId
    if (typeof req.body.user_id === "string") {
      req.body.user_id = new mongoose.Types.ObjectId(req.body.user_id);
    }

    const newRide = new RideRequest(req.body);
    await newRide.save();

    return res.status(201).json({
      success: true,
      message: "Ride request created successfully",
      request_id: newRide.request_id,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc Change ride request status to 'posted'
 * @route PATCH /api/ride-request/post
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
      return next(new Error("Ride request not found or already posted."));
    }

    return sendSuccessResponse(res, "Ride request posted successfully.");
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc Fetch active ride requests (non-cleared or cancelled) for a user
 * @route POST /api/fetch/ride-requests/active
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

    return sendSuccessResponse(res, "Active ride requests", activeRequests);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc Get all posted ride requests
 * @route GET /api/ride-requests/posted
 */
const getAllPostedRideRequests = async (req, res, next) => {
  try {
    const postedRequests = await RideRequest.find({ status: "posted" })
      .populate("user_id", "user_name")
      .select(
        "_id request_id status origin_location dest_location vehicle_details pickup_date updatedAt user_id"
      );

    return sendSuccessResponse(
      res,
      "All posted ride requests",
      postedRequests.map((req) => ({
        _id: req._id,
        request_id: req.request_id,
        status: req.status,
        origin_location: req.origin_location,
        dest_location: req.dest_location,
        vehicle_details: req.vehicle_details,
        pickup_date: req.pickup_date,
        updatedAt: req.updatedAt,
        username: req.user_id?.user_name || "Unknown",
      }))
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc Truck driver adds an offer to a ride request
 * @route POST /api/ride-request/add-offer
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
      { $push: { offers: { truck_id, offered_price } } },
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

/**
 * @desc Get nearby posted ride requests based on coordinates
 * @route POST /api/ride-requests/nearby
 */
const getNearbyRideRequests = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Missing coordinates" });
    }

    const results = await RideRequest.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "distanceInMeters",
          spherical: true,
          query: { status: "posted" },
        },
      },
      {
        $project: {
          request_id: 1,
          origin_location: 1,
          dest_location: 1,
          vehicle_details: 1,
          pickup_date: 1,
          updatedAt: 1,
          distanceInMeters: 1,
        },
      },
    ]);

    return sendSuccessResponse(res, "Nearby ride requests", results);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRideRequest,
  postRideRequest,
  getActiveRideRequestsByUser,
  getAllPostedRideRequests,
  addOfferToRideRequest,
  getNearbyRideRequests,
};
