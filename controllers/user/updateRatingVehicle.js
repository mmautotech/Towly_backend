// controllers/user/UpdateRatingVehicle.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /vehicle/update-rating:
 *   post:
 *     summary: Update vehicle rating using aggregation
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               vehicle_profile:
 *                 type: object
 *                 description: Include make, model, or reg number to verify identity
 *     responses:
 *       200:
 *         description: Vehicle rating updated using aggregation
 */
const UpdateRatingVehicle = async (req, res, next) => {
  try {
    const { rating, vehicle_profile = {} } = req.body;
    const user_id = req.user.id;

    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 0 and 5." });
    }

    const user = await User.findById(user_id);
    if (!user?.truck_profile?.vehicle_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle profile not found." });
    }

    const vp = user.truck_profile.vehicle_profile;
    if (
      (vehicle_profile.registration_number &&
        vp.registration_number !== vehicle_profile.registration_number) ||
      (vehicle_profile.make && vehicle_profile.make !== vp.make) ||
      (vehicle_profile.model && vehicle_profile.model !== vp.model)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Vehicle identity mismatch." });
    }

    const { rating: currentRating = 0, ratings_count = 0 } = vp;
    const newCount = ratings_count + 1;
    const newRating = (currentRating * ratings_count + rating) / newCount;

    user.truck_profile.vehicle_profile.rating = parseFloat(
      newRating.toFixed(2)
    );
    user.truck_profile.vehicle_profile.ratings_count = newCount;

    await user.save();

    sendSuccessResponse(res, "Vehicle rating updated via aggregation.");
  } catch (err) {
    next(err);
  }
};

module.exports = UpdateRatingVehicle;
