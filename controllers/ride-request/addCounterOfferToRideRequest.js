/**
 * @swagger
 * /ride-request/counter-offer:
 *   post:
 *     summary: User submits a counter offer for a specific offer
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [request_id, offer_id, client_counter_price]
 *             properties:
 *               request_id:
 *                 type: string
 *                 example: "680a484be39801f2e976da3b"
 *               offer_id:
 *                 type: string
 *                 example: "646a2a56e8414e38700a3627"
 *               client_counter_price:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Counter offer submitted successfully
 */
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

const addCounterOfferToRideRequest = async (req, res, next) => {
  try {
    const { request_id, offer_id, client_counter_price } = req.body;

    if (!request_id || !offer_id || client_counter_price == null) {
      return next(
        new Error(
          "request_id, offer_id, and client_counter_price are required."
        )
      );
    }

    // Locate the ride request and the specific offer sub-document by its own _id
    const result = await RideRequest.updateOne(
      {
        _id: new ObjectId(request_id),
        "offers._id": new ObjectId(offer_id),
      },
      {
        $set: {
          "offers.$.client_counter_price": client_counter_price,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return next(new Error("No matching offer found to update."));
    }

    return sendSuccessResponse(res, "Counter offer submitted successfully.");
  } catch (error) {
    return next(error);
  }
};

module.exports = addCounterOfferToRideRequest;
