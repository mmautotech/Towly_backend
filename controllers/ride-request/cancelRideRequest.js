// controllers/ride-request/cancelRideRequest.js
const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/cancel:
 *   patch:
 *     summary: Cancel a ride request
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_id
 *             properties:
 *               request_id:
 *                 type: string
 *                 example: 603d2f8e2f8c1b2a88f4db3c
 *     responses:
 *       200:
 *         description: Ride request cancelled successfully.
 *       400:
 *         description: Invalid request_id
 *       404:
 *         description: Ride request not found or not cancellable
 */
const cancelRideRequest = async (req, res, next) => {
  try {
    const userId    = req.user.id;
    const { request_id } = req.body;

    // 1) Validate request_id format
    if (!mongoose.Types.ObjectId.isValid(request_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request_id" });
    }

    // 2) Attempt to cancel only if status is still "created" or "posted"
    const updated = await RideRequest.findOneAndUpdate(
      {
        _id:     request_id,
        user_id: userId,
        status: { $in: ["created", "posted"] }
      },
      { status: "cancelled" },
      { new: true }
    );

    // 3) If no document was updated, it either doesn’t exist, doesn’t belong to this user,
    //    or is already in a non-cancellable state
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Ride request not found or cannot be cancelled." });
    }

    // 4) Success
    return sendSuccessResponse(res, "Ride request cancelled successfully.");
  } catch (err) {
    return next(err);
  }
};

module.exports = cancelRideRequest;
