// controllers/auth/loginUser.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login using phone number and password
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
 *                 example: secretPass123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid phone number or password
 */
/**
 * @desc  🔑 Login User using phone and password
 * @route POST /auth/login
 * @access Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return next(new Error("Invalid phone number or password!"));
    }

    const token = user.generateToken();
    sendSuccessResponse(res, "Login successful.", {
      token,
      user_id: user._id,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = loginUser;
