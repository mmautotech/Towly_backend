// controllers/user/UpdateRatingClient.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /client/update-rating:
 *   post:
 *     summary: Update client profile's rating using aggregation
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
 *               client_profile:
 *                 type: object
 *                 description: Include email or name to verify client identity
 *     responses:
 *       200:
 *         description: Client rating updated using aggregation
 */
const UpdateRatingClient = async (req, res, next) => {
  try {
    const { rating, client_profile = {} } = req.body;
    const user_id = req.user.id;

    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 0 and 5." });
    }

    const user = await User.findById(user_id);
    if (!user?.client_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Client profile not found." });
    }

    // Optional verification by email or full name
    if (
      (client_profile.email &&
        user.client_profile.email !== client_profile.email) ||
      (client_profile.first_name &&
        client_profile.last_name &&
        (user.client_profile.first_name !== client_profile.first_name ||
          user.client_profile.last_name !== client_profile.last_name))
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Client identity mismatch." });
    }

    const { rating: currentRating = 0, ratings_count = 0 } =
      user.client_profile;

    const newCount = ratings_count + 1;
    const newRating = (currentRating * ratings_count + rating) / newCount;

    user.client_profile.rating = parseFloat(newRating.toFixed(2));
    user.client_profile.ratings_count = newCount;

    await user.save();

    sendSuccessResponse(res, "Client rating updated via aggregation.");
  } catch (err) {
    next(err);
  }
};

module.exports = UpdateRatingClient;
