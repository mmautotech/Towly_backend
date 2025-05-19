// controllers/ride-request/getActiveRideRequest.js

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /fetch/ride-requests/active:
 *   post:
 *     summary: Get the authenticated user's single active ride request
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Single active ride request returned
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
 *                   example: Active ride request
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/RideRequest'
 *                     - type: 'null'
 */

/**
 * @desc Get the authenticated user's single active ride request
 * @route POST /api/fetch/ride-requests/active
 * @access Private (expects a valid JWT in Authorization header)
 */
const getActiveRideRequestByUser = async (req, res, next) => {
  try {
    // user_id comes from your auth middleware (e.g. decoded JWT)
    const user_id = req.user && req.user.id;
    if (!user_id || !ObjectId.isValid(user_id)) {
      return next(new Error("Unauthorized or invalid user token."));
    }

    // fetch one active request (status not cancelled or completed)
    const request = await RideRequest.findOne({
      user_id: new ObjectId(user_id),
      status: { $nin: ["cancelled", "completed"] },
    })
      .select(
        "_id status origin_location dest_location vehicle_details pickup_date"
      )
      .lean();

    return sendSuccessResponse(res, "Active ride request", request || null);
  } catch (error) {
    return next(error);
  }
};

module.exports = getActiveRideRequestByUser;
