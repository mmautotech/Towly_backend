const Offer = require("../models/offer-model");
const sendSuccessResponse = require("../utils/success-response");

/**
 * @desc    Truck posts an offer for a ride request
 * @route   POST /api/ride-request/offer
 * @access  Public
 */
const postOffer = async (req, res, next) => {
  try {
    const { request_id, truck_id, price_offered } = req.body;

    if (!request_id || !truck_id || !price_offered) {
      const error = new Error(
        "All fields (request_id, truck_id, price_offered) are required."
      );
      error.statusCode = 400;
      return next(error);
    }

    const newOffer = new Offer({ request_id, truck_id, price_offered });
    await newOffer.save();

    return sendSuccessResponse(res, "Offer submitted successfully.");
  } catch (error) {
    return next(error);
  }
};

module.exports = { postOffer };
