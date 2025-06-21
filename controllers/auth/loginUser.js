const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user using phone and password
 *     tags:
 *       - Auth
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
 *                 example: "+441234567890"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
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
 *                       description: JWT token for authenticated user
 *                     user_id:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [client, truck, admin]
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid phone number or password!
 */
const loginUser = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone }).select("+password");

    // ❌ Invalid user or password
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid phone number or password!" });
    }

    // ✅ No status-based restriction

    // ✅ Generate JWT token
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
