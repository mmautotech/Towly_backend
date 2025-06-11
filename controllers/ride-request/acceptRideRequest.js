const mongoose = require("mongoose");
const { RideRequest, User } = require("../../models");
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
 *                 message:
 *                   type: string
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
    const userId = req.user.id;
    const { request_id, offer_id } = req.body;

    // 🔍 Validate input
    if (!request_id || !offer_id) {
      return res.status(400).json({
        success: false,
        message: "Both request_id and offer_id are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(request_id) ||
      !mongoose.Types.ObjectId.isValid(offer_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request_id or offer_id format.",
      });
    }

    // 🚚 Update ride request
    const updated = await RideRequest.findOneAndUpdate(
      {
        _id: request_id,
        user_id: userId,
        status: "posted",
        "offers._id": offer_id,
      },
      {
        status: "accepted",
        accepted_offer: offer_id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found, not posted, or invalid offer.",
      });
    }

    // 📦 Find accepted offer
    const acceptedOffer = updated.offers.id(offer_id);
    if (!acceptedOffer) {
      return res.status(500).json({
        success: false,
        message: "Accepted offer not found in ride request.",
      });
    }

    // 👤 Find client user name
    const clientUser = await User.findById(updated.user_id).select("user_name");

    // 📡 Notify truck via socket
    const io = req.app.get("io");
    if (io) {
      const truckRoom = `truck_${acceptedOffer.truck_id.toString()}`;
      const payload = {
        request_id: updated._id.toString(),
        offer_id,
        client_id: updated.user_id.toString(),
        client_name: clientUser?.user_name || "Client",
        offered_price: acceptedOffer.offered_price,
        origin: {
          latitude: updated.origin_location.coordinates[1],
          longitude: updated.origin_location.coordinates[0],
        },
        destination: {
          latitude: updated.dest_location.coordinates[1],
          longitude: updated.dest_location.coordinates[0],
        },
      };

      console.log("🔔 Emitting 'offerAccepted' to:", truckRoom);
      console.log("📦 Payload:", payload);

      io.to(truckRoom).emit("offerAccepted", payload);
    } else {
      console.warn("⚠️ Socket.IO instance not available on req.app");
    }

    // ✅ Respond to client
    return sendSuccessResponse(res, "Offer accepted successfully", {
      request_id: updated._id.toString(),
      offer_id,
    });

  } catch (err) {
    console.error("❌ acceptRideRequest error:", err.message);
    next(err);
  }
};

module.exports = acceptRideRequest;
