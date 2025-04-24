const { User } = require("../../models");

/**
 * @swagger
 * /user/update-location:
 *   post:
 *     summary: Update truck's current geolocation (longitude, latitude)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, longitude, latitude]
 *             properties:
 *               user_id:
 *                 type: string
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Truck location updated
 */
const updateUserLocation = async (req, res, next) => {
  const { user_id, longitude, latitude } = req.body;

  if (!user_id || longitude == null || latitude == null) {
    return res.status(400).json({
      success: false,
      message: "user_id, longitude, and latitude are required",
    });
  }

  try {
    await User.findByIdAndUpdate(user_id, {
      geolocation: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    res.status(200).json({
      success: true,
      message: "Truck location updated.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateUserLocation;
