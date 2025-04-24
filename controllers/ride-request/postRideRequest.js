const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/post:
 *   patch:
 *     summary: Post a created ride request
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, request_id]
 *             properties:
 *               user_id:
 *                 type: string
 *               request_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ride request posted successfully
 */
/**
 * @desc Change ride request status to 'posted'
 * @route PATCH /api/ride-request/post
 */
const postRideRequest = async (req, res, next) => {
  try {
    const { user_id, request_id } = req.body;

    if (!user_id || !request_id) {
      return next(new Error("user_id and request_id are required."));
    }

    const updatedRequest = await RideRequest.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        _id: new ObjectId(request_id),
        status: "created",
      },
      { status: "posted" },
      { new: true }
    );

    if (!updatedRequest) {
      return next(new Error("Ride request not found or already posted."));
    }

    return sendSuccessResponse(res, "Ride request posted successfully.");
  } catch (error) {
    return next(error);
  }
};

module.exports = postRideRequest;
