const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/applied:
 *   post:
 *     summary: Get ride requests that the truck has already applied to
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
 *         description: Applied ride requests returned
 */
/**
 * @desc Get ride requests where truck has already applied
 * @route POST /api/ride-requests/applied
 */
const getAppliedRide_postedRequests = async (req, res, next) => {
  try {
    const { truck_id } = req.body;
    if (!truck_id) return next(new Error("truck_id is required."));

    const requests = await RideRequest.find({
      status: "posted",
      offers: {
        $elemMatch: {
          truck_id: new ObjectId(truck_id),
        },
      },
    })
      .populate("user_id", "user_name")
      .lean();

    const formatted = requests.map((req) => ({
      request_id: req._id,
      origin_location: req.origin_location,
      dest_location: req.dest_location,
      vehicle_details: req.vehicle_details,
      pickup_date: req.pickup_date,
      updatedAt: req.updatedAt,
      username: req.user_id?.user_name || "Unknown",
      offers: req.offers || [],
    }));

    return sendSuccessResponse(res, "Applied ride requests", formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = getAppliedRide_postedRequests;
