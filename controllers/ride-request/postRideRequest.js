// controllers/ride-request/postRideRequest.js
const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/post:
 *   patch:
 *     summary: Post a created ride request
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
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
 *                 example: 603d2f8e2f8c1b2a88f4db3c
 *     responses:
 *       200:
 *         description: Ride request posted successfully
 */
const postRideRequest = async (req, res, next) => {
  try {
    const userId    = req.user.id;
    const { request_id } = req.body;

    // 1) Basic ID format check
    if (!mongoose.Types.ObjectId.isValid(request_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request_id" });
    }

    // 2) Attempt the update
    const updated = await RideRequest.findOneAndUpdate(
      {
        user_id: userId,       // ← from JWT
        _id:     request_id,
        status:  "created",
      },
      { status: "posted" },
      { new: true }
    );

    // 3) Not found or already posted?
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Ride request not found or already posted." });
    }

    // 4) Success
    return sendSuccessResponse(res, "Ride request posted successfully.");
  } catch (err) {
    return next(err);
  }
};

module.exports = postRideRequest;
