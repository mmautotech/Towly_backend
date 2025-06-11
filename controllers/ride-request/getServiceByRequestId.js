const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /truck/services/{requestId}:
 *   get:
 *     summary: Get a single service by requestId (for truck)
 *     tags:
 *       - RideRequest
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The request ID to fetch service for
 *     responses:
 *       200:
 *         description: Single service data returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActiveServiceWithClientResponse'
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized (missing or invalid JWT)
 *       500:
 *         description: Internal server error
 */
const getServiceByRequestId = async (req, res, next) => {
  try {
    const { requestId } = req.params;

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid requestId format" });
    }

    const results = await RideRequest.aggregate([
      { $match: { _id: new ObjectId(requestId) } },

      // Populate client
      {
        $lookup: {
          from: "user_profiles",
          localField: "user_id",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },

      // Project shape
      {
        $project: {
          _id:               1,
          status:            1,
          origin_location:   1,
          dest_location:     1,
          pickup_date:       1,
          vehicle_details:   1,
          offers:            1,
          accepted_offer:    1,
          createdAt:         1,
          updatedAt:         1,

          client: {
            user_id:   "$client._id",
            user_name: "$client.user_name",
            photo:     "$client.client_profile.profile_photo.compressed.data"
          }
        }
      }
    ]);

    const service = results.length ? results[0] : null;

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    return sendSuccessResponse(res, "Service retrieved by requestId", service);
  } catch (error) {
    return next(error);
  }
};

module.exports = getServiceByRequestId;
