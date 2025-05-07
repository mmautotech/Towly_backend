const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
/**
 * @swagger
 * /ride-request/accept:
 *   patch:
 *     summary: Accept a ride request with a specific offer
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, request_id, offer_id]
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
 */
const acceptRideRequest = async (req, res, next) => {
  try {
    const { user_id, request_id, offer_id } = req.body;

    // ensure all parameters are provided
    if (!user_id || !request_id || !offer_id) {
      return next(new Error("user_id, request_id and offer_id are required."));
    }

    // validate ObjectId formats
    if (
      !ObjectId.isValid(user_id) ||
      !ObjectId.isValid(request_id) ||
      !ObjectId.isValid(offer_id)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid user_id, request_id or offer_id" });
    }

    // find the ride request that is still posted and contains the given offer
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

    // respond with custom message including the offer_id
    return sendSuccessResponse(res, `${offer_id} Offer accepted successfully`);
  } catch (error) {
    return next(error);
  }
};

module.exports = acceptRideRequest;
