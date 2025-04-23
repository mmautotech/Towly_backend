const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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

    if (typeof req.body.user_id === "string") {
      req.body.user_id = new ObjectId(req.body.user_id);
    }

    const newRide = new RideRequest(req.body);
    await newRide.save();

    return res.status(201).json({
      success: true,
      message: "Ride request created successfully",
      request_id: newRide._id,
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
      {
        user_id: new ObjectId(user_id),
        _id: new ObjectId(request_id),
        status: "created",
      },
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
 * @desc Change ride request status to 'posted'
 * @route PATCH /api/ride-request/cancel
 */
const cancelRideRequest = async (req, res, next) => {
  const { user_id, request_id } = req.body;
  if (!user_id || !request_id) {
    return res
      .status(400)
      .json({ message: "user_id and request_id are required" });
  }

  try {
    await RideRequest.findOneAndUpdate(
      { _id: request_id, user_id },
      { status: "cancelled" }
    );

    return res.json({
      success: true,
      message: "Ride request cancelled successfully.",
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * @desc Get user's active ride requests
 * @route POST /api/fetch/ride-requests/active
 */
const getActiveRideRequestsByUser = async (req, res, next) => {
  try {
    const { user_id } = req.body;

    if (!user_id || typeof user_id !== "string") {
      return next(new Error("Invalid or missing user_id."));
    }

    const activeRequests = await RideRequest.find({
      user_id: new ObjectId(user_id),
      status: { $nin: ["cleared", "cancelled"] },
    }).select("status origin_location dest_location vehicle_details");

    return sendSuccessResponse(res, "Active ride requests", activeRequests);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc Truck driver adds or updates an offer to a ride request
 * @route POST /api/ride-request/add-offer
 */
const addOfferToRideRequest = async (req, res, next) => {
  try {
    let { request_id, truck_id, offered_price, days, hours, minutes } =
      req.body;

    if (!request_id || !truck_id || offered_price == null) {
      return next(
        new Error("request_id, truck_id, and offered_price are required.")
      );
    }

    // Set defaults
    days = parseInt(days ?? 0, 10);
    hours = parseInt(hours ?? 0, 10);
    minutes = parseInt(minutes ?? 0, 10);

    const time_to_reach = `${days}d ${hours}h ${minutes}m`;

    if (!request_id || !truck_id || !offered_price || !time_to_reach) {
      return next(
        new Error(
          "request_id, truck_id, offered_price and time_to_reach are required."
        )
      );
    }

    const rideRequestObjectId = new ObjectId(request_id);
    const truckUserObjectId = new ObjectId(truck_id);

    // Try to update existing offer
    const updateResult = await RideRequest.updateOne(
      {
        _id: rideRequestObjectId,
        "offers.truck_id": truckUserObjectId,
      },
      {
        $set: {
          "offers.$.offered_price": offered_price,
          "offers.$.time_to_reach": time_to_reach,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      // No existing offer from this truck — push a new one
      const pushResult = await RideRequest.updateOne(
        { _id: rideRequestObjectId },
        {
          $push: {
            offers: {
              truck_id: truckUserObjectId,
              offered_price,
              time_to_reach,
            },
          },
        }
      );

      if (pushResult.modifiedCount === 0) {
        return next(new Error("Ride request not found."));
      }

      return sendSuccessResponse(res, "New offer added successfully.");
    }

    return sendSuccessResponse(res, "Offer updated successfully.");
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
    const { latitude, longitude, location_type = "origin" } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Missing coordinates" });
    }

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    const locationField =
      location_type === "destination" ? "dest_location" : "origin_location";

    let results = [];

    if (locationField === "origin_location") {
      results = await RideRequest.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: coordinates,
            },
            distanceField: "distanceInMeters",
            spherical: true,
            query: { status: "posted" },
            key: "origin_location",
          },
        },
        {
          $project: {
            request_id: "$_id",
            origin_location: 1,
            dest_location: 1,
            vehicle_details: 1,
            pickup_date: 1,
            updatedAt: 1,
            distanceInMeters: 1,
          },
        },
      ]);
    } else {
      const docs = await RideRequest.find({
        status: "posted",
        dest_location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: coordinates,
            },
            $maxDistance: 10000,
          },
        },
      }).select(
        "_id origin_location dest_location vehicle_details pickup_date updatedAt"
      );

      results = docs.map((doc) => ({
        request_id: doc._id,
        origin_location: doc.origin_location,
        dest_location: doc.dest_location,
        vehicle_details: doc.vehicle_details,
        pickup_date: doc.pickup_date,
        updatedAt: doc.updatedAt,
        distanceInMeters: null,
      }));
    }

    return sendSuccessResponse(res, "Nearby ride requests", results);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get ride requests where truck has already applied
 * @route POST /api/ride-requests/applied
 */
const getAppliedRide_postedRequests = async (req, res, next) => {
  try {
    const { truck_id } = req.body;
    if (!truck_id) return next(new Error("truck_id is required."));

    const requests = await RideRequest.find({
      status: "posted",
      offers: {
        $elemMatch: {
          truck_id: new ObjectId(truck_id),
        },
      },
    })
      .populate("user_id", "user_name")
      .lean();

    const formatted = requests.map((req) => ({
      request_id: req._id,
      origin_location: req.origin_location,
      dest_location: req.dest_location,
      vehicle_details: req.vehicle_details,
      pickup_date: req.pickup_date,
      updatedAt: req.updatedAt,
      username: req.user_id?.user_name || "Unknown",
      offers: req.offers || [],
    }));

    return sendSuccessResponse(res, "Applied ride requests", formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get ride requests the truck has NOT yet applied to
 * @route POST /api/ride-requests/new
 */
const getUnappliedRide_postedRequests = async (req, res, next) => {
  try {
    const { truck_id } = req.body;
    if (!truck_id) return next(new Error("truck_id is required."));

    const requests = await RideRequest.find({
      status: "posted",
      offers: {
        $not: {
          $elemMatch: {
            truck_id: new ObjectId(truck_id),
          },
        },
      },
    })
      .populate("user_id", "user_name")
      .lean();

    const formatted = requests.map((req) => ({
      request_id: req._id,
      origin_location: req.origin_location,
      dest_location: req.dest_location,
      vehicle_details: req.vehicle_details,
      pickup_date: req.pickup_date,
      updatedAt: req.updatedAt,
      username: req.user_id?.user_name || "Unknown",
      offers: req.offers || [],
    }));

    return sendSuccessResponse(res, "New (unapplied) ride requests", formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all offers made on a ride request
 * @route POST /api/ride-request/offers
 */
const getOffersForRideRequest = async (req, res, next) => {
  try {
    const { user_id, request_id } = req.body;

    if (!user_id || !request_id) {
      return next(new Error("user_id and request_id are required."));
    }

    const request = await RideRequest.findOne({
      _id: new ObjectId(request_id),
      user_id: new ObjectId(user_id),
    }).populate("offers.truck_id", "user_name");

    if (!request) {
      return next(new Error("Ride request not found."));
    }

    const formattedOffers = (request.offers || []).map((offer) => ({
      truck_username: offer.truck_id?.user_name || "Unknown",
      offered_price: offer.offered_price,
      time_to_reach: offer.time_to_reach,
    }));

    return res.status(200).json({
      success: true,
      message: "Offers retrieved successfully.",
      offers: formattedOffers,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRideRequest,
  postRideRequest,
  cancelRideRequest,
  getActiveRideRequestsByUser,
  addOfferToRideRequest,
  getNearbyRideRequests,
  getAppliedRide_postedRequests,
  getUnappliedRide_postedRequests,
  getOffersForRideRequest,
};
