// controllers/auth/forgotPassword.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Reset password using phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: +441234567890
 *               password:
 *                 type: string
 *                 example: newSecurePassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       404:
 *         description: User not found
 */
/**
 * @desc  🔄 Forgot Password: update password using phone number
 * @route POST /auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return next(new Error("User with this phone number does not exist."));
    }

    user.password = password;
    await user.save();

    const token = user.generateToken();
    sendSuccessResponse(res, "Password updated successfully.", {
      user_id: user._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = forgotPassword;
