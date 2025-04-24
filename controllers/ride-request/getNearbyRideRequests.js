const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/nearby:
 *   post:
 *     summary: Get nearby ride requests by coordinates
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Nearby ride requests returned
 */
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

module.exports = getNearbyRideRequests;
