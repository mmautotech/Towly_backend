// controllers/user/UpdateRatingVehicle.js

const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /vehicle/update-rating:
 *   post:
 *     summary: Authenticated user updates another user's vehicle rating via aggregation
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_id
 *               - rating
 *             properties:
 *               vehicle_id:
 *                 type: string
 *                 description: The user_id of the vehicle owner whose rating is to be updated
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Vehicle rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle rating updated successfully.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
const UpdateRatingVehicle = async (req, res, next) => {
  try {
    const { vehicle_id, rating } = req.body;
    const raterId = req.user.id;

    // Validate inputs
    if (!vehicle_id) {
      return res
        .status(400)
        .json({ success: false, message: "vehicle_id is required." });
    }
    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 0 and 5." });
    }

    // Fetch the target user whose vehicle rating will be updated
    const targetUser = await User.findById(vehicle_id);
    if (!targetUser?.truck_profile?.vehicle_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle profile not found." });
    }

    const vp = targetUser.truck_profile.vehicle_profile;
    const currentRating = vp.rating || 0;
    const currentCount = vp.ratings_count || 0;

    // Compute new aggregated rating
    const newCount = currentCount + 1;
    const newRating = (currentRating * currentCount + rating) / newCount;

    vp.rating = parseFloat(newRating.toFixed(2));
    vp.ratings_count = newCount;

    // Persist changes
    targetUser.markModified("truck_profile.vehicle_profile");
    await targetUser.save();

    // Send only status, message, timestamp
    return sendSuccessResponse(res, "Vehicle rating updated successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = UpdateRatingVehicle;
