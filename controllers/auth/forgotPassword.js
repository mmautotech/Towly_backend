// controllers/auth/forgotPassword.js
const { User } = require("../../models");

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
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: +441234567890
 *               password:
 *                 type: string
 *                 example: newSecurePassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: password changed
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
/**
 * @desc   🔄 Forgot Password: update password using phone number
 * @route  POST /auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      // delegate to error middleware to format your error response
      return next(new Error("User with this phone number does not exist!"));
    }

    user.password = password;
    await user.save();

    // minimal success response
    return res.status(200).json({ message: "password changed successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = forgotPassword;