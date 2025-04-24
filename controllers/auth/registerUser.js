const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: JohnDoe
 *               phoneNo:
 *                 type: string
 *                 example: +441234567890
 *               password:
 *                 type: string
 *                 example: secretPass123
 *               role:
 *                 type: string
 *                 enum: [admin, truck, client]
 *                 example: client
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Phone number already exists
 */
/**
 * @desc  👤 Register a new user (Signup)
 * @route POST /auth/register
 * @access Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { username, phoneNo, password, role } = req.body;
    const existingUser = await User.findOne({ phone: phoneNo });
    if (existingUser) {
      return next(new Error("Phone number already exists!"));
    }

    const allowedRoles = ["admin", "truck", "client"];
    const userRole = role && allowedRoles.includes(role) ? role : "client";

    const newUser = new User({
      user_name: username,
      phone: phoneNo,
      password,
      role: userRole,
    });
    await newUser.save();
    const token = newUser.generateToken();

    sendSuccessResponse(
      res,
      "User registered successfully.",
      { token, user_id: newUser._id },
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = registerUser;
