// ===================== 🌐 Import Required Modules ===================== //
const User = require("../models/user-model"); // User model for database operations
const sendSuccessResponse = require("../utils/success-response");

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
    // Extract fields from request body
    const { username, phoneNo, password, role } = req.body;

    // Check if the phone number already exists
    const existingUser = await User.findOne({ phone: phoneNo });
    if (existingUser) {
      const error = new Error(
        "Phone number already exists! Try logging in or resetting your password."
      );
      error.statusCode = 400;
      return next(error);
    }

    // Determine role: if provided and valid, use it; otherwise default to "client"
    const allowedRoles = ["admin", "truck", "client"];
    const userRole = role && allowedRoles.includes(role) ? role : "client";

    // Create new user (mapping front-end fields to model fields)
    const newUser = new User({
      user_name: username,
      phone: phoneNo,
      password,
      role: userRole,
    });
    await newUser.save();

    // Generate JWT token
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
 *               phoneNo:
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
    const { phoneNo, password } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phone: phoneNo }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      const error = new Error("Invalid phone number or password!");
      error.statusCode = 401;
      return next(error);
    }

    const token = user.generateToken();

    sendSuccessResponse(
      res,
      "Login successful.",
      {
        token,
        user_id: user._id,
        role: user.role, // ✅ Included role in response
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

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
 *               phoneNo:
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
    const { phoneNo, password } = req.body; // 'password' is the new password

    // Find user by phone number
    const user = await User.findOne({ phone: phoneNo });
    if (!user) {
      const error = new Error("User with this phone number does not exist.");
      error.statusCode = 404;
      return next(error);
    }

    // Update password (the pre-save hook will hash the new password)
    user.password = password;
    await user.save();

    // Generate a new token after the password change
    const token = user.generateToken();

    sendSuccessResponse(
      res,
      "Password updated successfully.",
      { token, user_id: user._id },
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, forgotPassword };
// ===================== 🌐 Export Module ===================== //
