// controllers/user/updateUserRating.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /user/update-rating:
 *   post:
 *     summary: Update a user's rating (between 0 and 5)
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
 *               - user_id
 *               - rating
 *             properties:
 *               user_id:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Rating updated successfully
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
 *                   example: Truck rating updated successfully.
 *       400:
 *         description: Bad request – missing or invalid fields
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Internal server error
 */
const updateUserRating = async (req, res, next) => {
  const { user_id, rating } = req.body;

  if (!user_id || typeof rating !== "number" || rating < 0 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Valid user_id and rating (0 to 5) are required.",
    });
  }

  try {
    await User.findByIdAndUpdate(user_id, { rating });
    sendSuccessResponse(res, "Truck rating updated successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = updateUserRating;
