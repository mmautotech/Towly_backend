const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /user/update-rating:
 *   post:
 *     summary: Update rating for another user (client or vehicle) based on authenticated user's role
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
 *               - target_id
 *               - rating
 *             properties:
 *               target_id:
 *                 type: string
 *                 description: The user_id of the client or truck being rated
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Action not allowed
 *       404:
 *         description: Target not found
 *       500:
 *         description: Server error
 */
const updateRating = async (req, res, next) => {
  try {
    const { target_id, rating } = req.body;
    const rater = req.user;

    if (!target_id || typeof target_id !== "string") {
      return res.status(400).json({
        success: false,
        message: "target_id is required and must be a string.",
      });
    }

    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 0 and 5.",
      });
    }

    const targetUser = await User.findById(target_id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found.",
      });
    }

    // Role-based validation and update
    if (rater.role === "truck" && targetUser.role === "client") {
      // Update client rating
      const profile = targetUser.client_profile;
      const currentRating = profile?.rating || 0;
      const currentCount = profile?.ratings_count || 0;

      const newCount = currentCount + 1;
      const newRating = (currentRating * currentCount + rating) / newCount;

      targetUser.client_profile.rating = parseFloat(newRating.toFixed(2));
      targetUser.client_profile.ratings_count = newCount;

      targetUser.markModified("client_profile");
      await targetUser.save();

      return sendSuccessResponse(res, "Client rating updated successfully.");
    }

    if (rater.role === "client" && targetUser.role === "truck") {
      // Update truck vehicle rating
      const vp = targetUser.truck_profile?.vehicle_profile;

      if (!vp) {
        return res.status(404).json({
          success: false,
          message: "Target truck does not have a vehicle profile.",
        });
      }

      const currentRating = vp.rating || 0;
      const currentCount = vp.ratings_count || 0;

      const newCount = currentCount + 1;
      const newRating = (currentRating * currentCount + rating) / newCount;

      vp.rating = parseFloat(newRating.toFixed(2));
      vp.ratings_count = newCount;

      targetUser.markModified("truck_profile.vehicle_profile");
      await targetUser.save();

      return sendSuccessResponse(res, "Vehicle rating updated successfully.");
    }

    // ❌ Same-role or admin-rating is not allowed
    return res.status(403).json({
      success: false,
      message: `Users with role '${rater.role}' are not permitted to rate users with role '${targetUser.role}'.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateRating;
