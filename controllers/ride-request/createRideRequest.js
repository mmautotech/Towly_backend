// controllers/ride-request/createRideRequest.js
const { RideRequest } = require("../../models");

/**
 * @swagger
 * /ride-request/create:
 *   post:
 *     summary: Create a new ride request
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RideRequestInput'
 *     responses:
 *       201:
 *         description: Ride request created successfully
 */
const createRideRequest = async (req, res, next) => {
  try {
    // Always start with an empty offers array
    const offers = [];

    // Default any missing vehicle fields
    const vehicle = { ...req.body.vehicle_details };
    vehicle.vehicle_category ??= "donot-apply";
    vehicle.loaded           ??= "donot-apply";
    vehicle.wheels_category  ??= "Rolling";

    // Build the document payload
    // Mongoose will cast the string ID into ObjectId automatically
    const newRide = await RideRequest.create({
      user_id:         req.user.id,             // ← from authenticateToken
      origin_location: req.body.origin_location,
      dest_location:   req.body.dest_location,
      pickup_date:     new Date(req.body.pickup_date),
      vehicle_details: vehicle,
      offers,
    });

    return res.status(201).json({
      success:    true,
      message:    "Ride request created successfully",
      request_id: newRide._id.toString(),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = createRideRequest;
