const { RideRequest } = require("../../models");
const reverseGeocode = require("../../utils/reverseGeocode");

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
    // Start with empty offers array
    const offers = [];

    // Default any missing vehicle fields
    const vehicle = { ...req.body.vehicle_details };
    vehicle.vehicle_category ??= "donot-apply";
    vehicle.loaded ??= "Unloaded";
    vehicle.wheels_category ??= "Wheels Are Rolling";

    // Extract coordinates from request
    const originCoords = req.body.origin_location.coordinates;
    const destCoords = req.body.dest_location.coordinates;

    // Reverse geocode if address is not provided
    const originAddress = req.body.origin_location.address || await reverseGeocode(originCoords);
    const destAddress = req.body.dest_location.address || await reverseGeocode(destCoords);

    // Build origin and destination objects
    const origin = { type: "Point", coordinates: originCoords, address: originAddress };
    const dest = { type: "Point", coordinates: destCoords, address: destAddress };

    // Create RideRequest document
    const newRide = await RideRequest.create({
      user_id: req.user.id, // from authenticateToken
      origin_location: origin,
      dest_location: dest,
      pickup_date: new Date(req.body.pickup_date),
      vehicle_details: vehicle,
      offers,
    });

    return res.status(201).json({
      success: true,
      message: "Ride request created successfully",
      request_id: newRide._id.toString(),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = createRideRequest;
