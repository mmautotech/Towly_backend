// controllers/ride-request/acceptRideRequest.js
const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/accept:
 *   patch:
 *     summary: Accept a ride request with a specific offer and notify the truck
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
 *               - offer_id
 *             properties:
 *               request_id:
 *                 type: string
 *                 example: 603d2f8e2f8c1b2a88f4db3c
 *               offer_id:
 *                 type: string
 *                 example: 603d2f8e2f8c1b2a88f4db4d
 *     responses:
 *       200:
 *         description: Offer accepted successfully.
 *       400:
 *         description: Missing or invalid IDs
 *       404:
 *         description: Ride request not found or not in “posted” status
 */
const acceptRideRequest = async (req, res, next) => {
  try {
    const userId     = req.user.id;
    const { request_id, offer_id } = req.body;

    // 1) Basic presence check
    if (!request_id || !offer_id) {
      return res.status(400).json({
        success: false,
        message: "request_id and offer_id are required."
      });
    }

    // 2) Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(request_id) ||
      !mongoose.Types.ObjectId.isValid(offer_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request_id or offer_id."
      });
    }

    // 3) Find+update only if it belongs to this user, is still “posted” and contains that offer
    const updated = await RideRequest.findOneAndUpdate(
      {
        _id:       new mongoose.Types.ObjectId(request_id),
        user_id:   new mongoose.Types.ObjectId(userId),
        status:    "posted",
        "offers._id": new mongoose.Types.ObjectId(offer_id),
      },
      {
        status:          "accepted",
        accepted_offer:  new mongoose.Types.ObjectId(offer_id),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found, not posted, or offer_id invalid."
      });
    }

    // 4) Notify the truck
    const acceptedOffer = updated.offers.id(offer_id);
    if (acceptedOffer) {
      const io = req.app.get("io");
      io.to(`truck_${acceptedOffer.truck_id.toString()}`)
        .emit("offerAccepted", {
          request_id: updated._id.toString(),
          offer_id,
        });
    }

    // 5) Return success
    return sendSuccessResponse(res, "Offer accepted successfully", {
      request_id: updated._id.toString(),
      offer_id,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = acceptRideRequest;
