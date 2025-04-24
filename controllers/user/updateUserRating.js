const { User } = require("../../models");

/**
 * @swagger
 * /user/update-rating:
 *   post:
 *     summary: Update truck's rating (between 0 and 5)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, rating]
 *             properties:
 *               user_id:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Truck rating updated
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

    res.status(200).json({
      success: true,
      message: "Truck rating updated.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateUserRating;
