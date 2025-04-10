const RideRequest = require("../models/ride-request-model");
const sendSuccessResponse = require("../utils/success-response");

const createRideRequest = async (req, res, next) => {
  try {
    const newRide = new RideRequest(req.body);
    await newRide.save();

    return sendSuccessResponse(res, "Ride request created successfully");
  } catch (error) {
    return next(error); // Pass error to express error handler
  }
};

module.exports = { createRideRequest };
