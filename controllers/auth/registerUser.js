// controllers/auth/registerUser.js
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
 *               user_name:
 *                 type: string
 *                 example: JohnDoe
 *               phone:
 *                 type: string
 *                 example: +441234567890
 *               password:
 *                 type: string
 *                 example: secretPass123
 *               role:
 *                 type: string
 *                 enum: [admin, driver, client]
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
    const { user_name, phone, password, role } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return next(new Error("Phone number already exists!"));
    }

    const allowedRoles = ["admin", "driver", "client"];
    const userRole = role && allowedRoles.includes(role) ? role : "client";

    const newUser = new User({
      user_name,
      phone,
      password,
      role: userRole,
    });
    await newUser.save();

    sendSuccessResponse(
      res,
      "User registered successfully.",
      { user_id: newUser._id },
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = registerUser;
