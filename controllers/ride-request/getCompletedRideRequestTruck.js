const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/completedtruck:
 *   post:
 *     summary: Get completed ride requests for a trucker
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [truck_id]
 *             properties:
 *               truck_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Completed ride requests returned
 */
const getCompletedRideTruck = async (req, res, next) => {
  try {
    const { truck_id } = req.body;
    if (!truck_id) return next(new Error("Truck ID is required."));

    // Find all completed ride requests where this truck has made an offer
    const requests = await RideRequest.find({
      status: "completed",
      offers: { $elemMatch: { truck_id } },
    }).lean();

    const formatted = requests.map((r) => {
      const firstOffer = (r.offers || [])[0];
      // Find the matching offer from this truck
      const matchedOffer = (r.offers || []).find(
        (o) => o.truck_id === truck_id
      );

      const updatedAt = new Date(r.updatedAt);

      const date = updatedAt
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
        .toUpperCase();

      const time = updatedAt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        request_id: r._id,
        origin_location: r.origin_location,
        dest_location: r.dest_location,
        offered_price: firstOffer?.offered_price || null,
        date,
        time,
      };
    });

    return sendSuccessResponse(res, "Completed rides fetched", formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = getCompletedRideTruck;
