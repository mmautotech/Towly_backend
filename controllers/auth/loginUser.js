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
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: +441234567890
 *               password:
 *                 type: string
 *                 example: secretPass123
 *     responses:
 *       '200':
 *         description: Login successful
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
 *                   example: Login successful.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT for accessing protected routes
 *                     user_id:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [client, driver, admin]
 *       '401':
 *         description: Invalid phone number or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid phone number or password!
 */

/**
 * @desc  🔑 Login User using phone and password
 * @route POST /auth/login
 * @access Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // fetch with password for comparison
    const user = await User.findOne({ phone }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password!",
      });
    }

    // generate JWT
    const token = user.generateToken();

    // send back token + basic info
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
