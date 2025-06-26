// controllers/ride-request/completeRideRequest.js

const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/complete:
 *   patch:
 *     summary: Mark ride request as completed by client or system
 *     security:
 *       - bearerAuth: []
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [request_id]
 *             properties:
 *               request_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ride request completed successfully
 *       400:
 *         description: Invalid or missing request_id
 *       404:
 *         description: Ride request not found or not accepted
 */
const completeRideRequest = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const { request_id: requestId } = req.body;

    // Step 1: Validate
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Valid request_id is required." });
    }

    // Step 2: Update the ride status
    const ride = await RideRequest.findOneAndUpdate(
      {
        _id: requestId,
        user_id: clientId,
        status: "accepted",
      },
      { status: "completed" },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or not in accepted status.",
      });
    }

    // Optional: Add post-completion actions here (e.g., rating, payout, etc.)

    return sendSuccessResponse(res, "Ride marked as completed successfully.", {
      request_id: ride._id.toString(),
      status: ride.status,
    });

  } catch (error) {
    console.error("❌ completeRideRequest error:", error);
    next(error);
  }
};

module.exports = completeRideRequest;
