// controllers/user/UpdateRatingClient.js

const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /client/update-rating:
 *   post:
 *     summary: Truck updates a client's rating via aggregation
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
 *               - client_id
 *               - rating
 *             properties:
 *               client_id:
 *                 type: string
 *                 description: The user_id of the client to be rated
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Client rating updated successfully
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
 *                   example: Client rating updated successfully.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
const UpdateRatingClient = async (req, res, next) => {
  try {
    const { client_id, rating } = req.body;
    const raterTruckId = req.user.id;

    // Validate inputs
    if (!client_id) {
      return res
        .status(400)
        .json({ success: false, message: "client_id is required." });
    }
    if (!rating) {
      return res
        .status(400)
        .json({ success: false, message: "Rating is required." });
    }
    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 0 and 5." });
    }

    // Fetch the target client
    const clientUser = await User.findById(client_id);
    if (!clientUser?.client_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found." });
    }

    // Compute new aggregated rating
    const currentRating = clientUser.client_profile.rating || 0;
    const currentCount = clientUser.client_profile.ratings_count || 0;
    const newCount = currentCount + 1;
    const newRating = (currentRating * currentCount + rating) / newCount;

    // Update and save
    clientUser.client_profile.rating = parseFloat(newRating.toFixed(2));
    clientUser.client_profile.ratings_count = newCount;
    clientUser.markModified("client_profile");
    await clientUser.save();

    // Only return status/message/timestamp
    return sendSuccessResponse(res, "Client rating updated successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = UpdateRatingClient;
