// controllers/ride-request/addCounterOfferToRideRequest.js
const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/counter-offer:
 *   patch:
 *     summary: Submit a counter‐offer on one of your posted ride requests
 *     tags:
 *       - RideRequest
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer_id
 *               - client_counter_price
 *             properties:
 *               offer_id:
 *                 type: string
 *                 example: "646a2a56e8414e38700a3627"
 *               client_counter_price:
 *                 type: number
 *                 example: 750
 *     responses:
 *       200:
 *         description: Counter offer submitted successfully.
 *       400:
 *         description: Validation error (missing or invalid params)
 *       401:
 *         description: Unauthorized — missing/invalid JWT
 *       404:
 *         description: No matching posted ride or offer found
 */
async function addCounterOfferToRideRequest(req, res, next) {
  try {
    const clientId = req.user.id;
    const { offer_id, client_counter_price } = req.body;

    // 1) Required fields
    if (!offer_id || client_counter_price == null) {
      return res.status(400).json({
        success: false,
        message: "Both offer_id and client_counter_price are required.",
      });
    }

    // 2) Validate ObjectId formats
    if (
      !mongoose.Types.ObjectId.isValid(offer_id) ||
      !mongoose.Types.ObjectId.isValid(clientId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer_id or user authentication token.",
      });
    }

    // 3) Update only if the ride belongs to this client and is still posted
    const result = await RideRequest.updateOne(
      {
        user_id: new mongoose.Types.ObjectId(clientId),
        status: "posted",
        "offers._id": new mongoose.Types.ObjectId(offer_id),
        "offers.available": true,
      },
      {
        $set: {
          "offers.$.client_counter_price": client_counter_price,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to submit counter offer. The ride may be closed or the truck may no longer be available.",
      });
    }

    // 4) Success
    return sendSuccessResponse(res, "Counter offer submitted successfully.");
  } catch (error) {
    next(error);
  }
}

module.exports = addCounterOfferToRideRequest;
