const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/active/truck:
 *   get:
 *     summary: Get only the essential active service info for the authenticated truck
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Minimal active ride details returned (or null if none)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MinimalActiveServiceResponse'
 */
const getActiveServiceByTruck = async (req, res, next) => {
  try {
    const truckId = req.user?.id;
    if (!truckId || !ObjectId.isValid(truckId)) {
      return next(new Error("Unauthorized or invalid truck token."));
    }

    const truckObjectId = new ObjectId(truckId);

    const results = await RideRequest.aggregate([
      // 1) Match only accepted rides
      { $match: { status: "accepted" } },

      // 2) Unwind offers
      { $unwind: "$offers" },

      // 3) Match if accepted offer belongs to this truck
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$offers._id", "$accepted_offer"] },
              { $eq: ["$offers.truck_id", truckObjectId] }
            ]
          }
        }
      },

      // 4) Lookup client info
      {
        $lookup: {
          from: "user_profiles",
          localField: "user_id",
          foreignField: "_id",
          as: "client"
        }
      },

      // 5) Flatten client
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },

      // 6) Project only required fields
      {
        $project: {
          pickup_date: 1,
          origin_location: 1,
          dest_location: 1,
          status: 1,
          "vehicle_details": 1,
          "offers.offered_price": 1,
          "offers.time_to_reach": 1,
          client: {
            client_id: "$client._id",
            client_name: "$client.user_name",
            client_photo: "$client.client_profile.profile_photo.compressed.data"
          }
        }
      },

      { $limit: 1 }
    ]);

    const minimalService = results.length ? results[0] : null;
    return sendSuccessResponse(res, "Minimal active service ride", minimalService);
  } catch (error) {
    return next(error);
  }
};

module.exports = getActiveServiceByTruck;
