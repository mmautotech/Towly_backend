const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");

/**
 * @swagger
 * /create/ride-request:
 *   post:
 *     summary: Create a new ride request
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RideRequest'
 *     responses:
 *       201:
 *         description: Ride request created successfully
 */
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

module.exports = createRideRequest;
