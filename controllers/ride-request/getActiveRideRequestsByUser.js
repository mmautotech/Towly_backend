const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
/**
 * @swagger
 * /fetch/ride-requests/active:
 *   post:
 *     summary: Get user's active ride requests
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Active ride requests returned
 */
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
      status: { $nin: ["cancelled", "completed"] },
    }).select(
      "status origin_location dest_location vehicle_details pickup_date"
    );

    return sendSuccessResponse(res, "Active ride requests", activeRequests);
  } catch (error) {
    return next(error);
  }
};

module.exports = getActiveRideRequestsByUser;
