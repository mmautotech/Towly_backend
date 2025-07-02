const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

const completeRideRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const truckId = req.user.id;
    const { request_id: requestId } = req.body;

    // Validate request ID
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Valid request_id is required." });
    }

    // Find ride within transaction
    const ride = await RideRequest.findById(requestId).session(session);
    if (!ride || ride.status !== "accepted") {
      return res.status(404).json({ success: false, message: "Ride not found or not in accepted status." });
    }

    // Check offer belongs to this truck
    const acceptedOffer = ride.offers.id(ride.accepted_offer);
    if (!acceptedOffer || acceptedOffer.truck_id.toString() !== truckId) {
      return res.status(403).json({ success: false, message: "You are not authorized to complete this ride." });
    }

    // 1. Mark this ride as completed
    ride.status = "completed";
    ride.completedAt = new Date();
    await ride.save({ session });

    // 2. Re-enable truck's other offers on posted rides
    await RideRequest.updateMany(
      {
        _id: { $ne: ride._id },
        "offers.truck_id": truckId,
        "offers.available": false,
        status: "posted"
      },
      {
        $set: { "offers.$[elem].available": true }
      },
      {
        arrayFilters: [{ "elem.truck_id": truckId }],
        session
      }
    );

    // 3. Emit socket to client
    const io = req.app.get("io");
    if (io) {
      const clientRoom = `client_${ride.user_id.toString()}`;
      const payload = {
        request_id: ride._id.toString(),
        message: "Your ride has been marked as completed by the truck.",
      };
      io.to(clientRoom).emit("rideCompleted", payload);
      console.log("🔔 Emitted 'rideCompleted' to:", clientRoom);
    }

    await session.commitTransaction();
    session.endSession();

    return sendSuccessResponse(res, "Ride marked as completed successfully.", {
      ride_id: ride._id.toString(),
      status: ride.status,
    });

  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    console.error("❌ completeRideRequest error:", err);
    next(err);
  }
};

module.exports = completeRideRequest;
