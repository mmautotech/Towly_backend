const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

const completeRideRequest = async (req, res, next) => {
  try {
    const truckId = req.user.id; // logged-in truck user
    const { request_id: requestId } = req.body;
 
    // Validate request_id
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Valid request_id is required." });
    }

   // Find the ride and check ownership
    const ride = await RideRequest.findById(requestId);

    if (!ride || ride.status !== "accepted") {
      return res.status(404).json({ success: false, message: "Ride not found or not in accepted status." });
    }

    // Check if the accepted offer belongs to this truck
    const acceptedOffer = ride.offers.id(ride.accepted_offer);

    if (!acceptedOffer || acceptedOffer.truck_id.toString() !== truckId) {
      return res.status(403).json({ success: false, message: "You are not authorized to complete this ride." });
    }

    // Mark ride as completed
    ride.status = "completed";
    await ride.save();

    // Emit to client
    const io = req.app.get("io");
    if (io) {
      const clientRoom = `client_${ride.user_id.toString()}`;
      const payload = {
        request_id: ride._id.toString(),
        message: "Your ride has been marked as completed by the truck."
      };
      io.to(clientRoom).emit("rideCompleted", payload);
      console.log("🔔 Emitted 'rideCompleted' to:", clientRoom);
    }

    return sendSuccessResponse(res, "Ride marked as completed successfully.", {
      request_id: ride._id.toString(),
      status: ride.status,
    });

  } catch (err) {
    console.error("❌ completeRideRequest error:", err);
    next(err);
  }
};

module.exports = completeRideRequest;
