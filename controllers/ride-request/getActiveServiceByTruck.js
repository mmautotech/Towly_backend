// controllers/ride-request/getActiveServiceByTruck.js

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/active/truck:
 *   get:
 *     summary: Get the authenticated truck's single active (accepted) service
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Single active service ride request returned (or null)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Active service ride request"
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/RideRequest'
 *                     - type: 'null'
 */
const getActiveServiceByTruck = async (req, res, next) => {
  try {
    const truckId = req.user && req.user.id;
    if (!truckId || !ObjectId.isValid(truckId)) {
      return next(new Error("Unauthorized or invalid truck token."));
    }
    const truckObjectId = new ObjectId(truckId);

    // Aggregate: find rides where status = "accepted" and the accepted_offer belongs to this truck
    const results = await RideRequest.aggregate([
      { $match: { status: "accepted" } },
      { $unwind: "$offers" },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$offers._id", "$accepted_offer"] },
              { $eq: ["$offers.truck_id", truckObjectId] },
            ],
          },
        },
      },
      // Optionally, reassemble the full document (keep all fields)
      {
        $project: {
          _id: 1,
          user_id: 1,
          origin_location: 1,
          dest_location: 1,
          pickup_date: 1,
          vehicle_details: 1,
          offers: 1,
          accepted_offer: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $limit: 1 },
    ]);

    const activeService = results.length ? results[0] : null;
    return sendSuccessResponse(res, "Active service ride request", activeService);
  } catch (error) {
    return next(error);
  }
};

module.exports = getActiveServiceByTruck;
