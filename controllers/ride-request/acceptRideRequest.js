// controllers/ride-request/acceptRideRequest.js

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/accept:
 *   patch:
 *     summary: Accept a ride request with a specific offer and notify the truck
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - request_id
 *               - offer_id
 *             properties:
 *               user_id:
 *                 type: string
 *               request_id:
 *                 type: string
 *               offer_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offer accepted successfully.
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
 *                   example: Offer accepted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: string
 *                     offer_id:
 *                       type: string
 */
const acceptRideRequest = async (req, res, next) => {
  try {
    const { user_id, request_id, offer_id } = req.body;

    if (!user_id || !request_id || !offer_id) {
      return next(new Error("user_id, request_id and offer_id are required."));
    }

    if (
      !ObjectId.isValid(user_id) ||
      !ObjectId.isValid(request_id) ||
      !ObjectId.isValid(offer_id)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid user_id, request_id or offer_id" });
    }

    const updatedRequest = await RideRequest.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        _id: new ObjectId(request_id),
        status: "posted",
        "offers._id": new ObjectId(offer_id),
      },
      {
        status: "accepted",
        accepted_offer: new ObjectId(offer_id),
      },
      { new: true }
    );

    if (!updatedRequest) {
      return next(
        new Error("Ride request not found, not posted, or offer_id invalid.")
      );
    }

    // Notify the truck via Socket.IO
    const acceptedOffer = updatedRequest.offers.find((o) =>
      o._id.equals(offer_id)
    );
    if (acceptedOffer) {
      const io = req.app.get("io");
      io.to(`truck_${acceptedOffer.truck_id.toString()}`).emit(
        "offerAccepted",
        {
          request_id: updatedRequest._id.toString(),
          offer_id,
        }
      );
    }

    return sendSuccessResponse(res, "Offer accepted successfully", {
      request_id: updatedRequest._id.toString(),
      offer_id,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = acceptRideRequest;
