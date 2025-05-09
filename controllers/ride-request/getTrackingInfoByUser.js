const mongoose = require("mongoose");
const { RideRequest, User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

const getTrackingInfoByUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    // Find the ride request with the truck_id in the offers
    const rideRequest = await RideRequest.findOne({
      "offers.truck_id": user_id,
    }).lean();

    if (!rideRequest || !rideRequest.accepted_offer) {
      return res
        .status(404)
        .json({ message: "Tracking info not found for this truck." });
    }

    // Find the accepted offer in the ride request
    const acceptedOfferId = rideRequest.accepted_offer.toString();
    const acceptedOffer = rideRequest.offers.find(
      (offer) => offer._id.toString() === acceptedOfferId
    );

    if (
      !acceptedOffer ||
      !acceptedOffer.location ||
      !acceptedOffer.location.coordinates
    ) {
      return res
        .status(404)
        .json({ message: "Accepted offer location not found." });
    }

    const { coordinates } = acceptedOffer.location;

    // Ensure coordinates are in the correct format: [longitude, latitude]
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: "Invalid coordinates format." });
    }

    const [longitude, latitude] = coordinates;

    // Fetch trucker info using truck_id from User model
    const trucker = await User.findById(acceptedOffer.truck_id).lean();

    if (!trucker) {
      return res.status(404).json({ message: "Trucker not found." });
    }

    return res.json({
      truck_location: {
        latitude,
        longitude,
      },
      truck_id: acceptedOffer.truck_id,
      trucker_name: trucker.user_name || "Unknown",
      time_to_reach: acceptedOffer.time_to_reach || "N/A", // Default to 'N/A' if not provided
      distance: acceptedOffer.distance || "N/A", // Default to 'N/A' if not provided
    });
  } catch (error) {
    console.error("Error fetching tracking info:", error);
    return next(error);
  }
};

module.exports = getTrackingInfoByUser;
