// controllers/auth/registerUser.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_name
 *               - phone
 *               - email
 *               - password
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: JohnDoe
 *               phone:
 *                 type: string
 *                 example: +441234567890
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Secret@123
 *               role:
 *                 type: string
 *                 enum: [client, driver, admin]
 *                 example: client
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: User created successfully.
 *       400:
 *         description: Missing fields or duplicate phone/email
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
 *                   example: Email already exists.
 */

/**
 * @desc  👤 Register a new user (Signup)
 * @route POST /auth/register
 * @access Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { user_name, phone, email, password, role } = req.body;

    // Create & save new user; let mongoose catch duplicates
    const newUser = new User({ user_name, phone, email, password, role });
    await newUser.save();

    // On success, return 201 with a simple message
    return res.status(201).json({
      success: true,
      message: "User created successfully.",
    });
  } catch (err) {
    // Handle duplicate‐key errors for phone or email
    if (err.code === 11000) {
      const dupField = Object.keys(err.keyValue)[0];
      const fieldName = dupField === "phone" ? "Phone number" : "Email";
      return res.status(400).json({
        success: false,
        message: `${fieldName} already exists.`,
      });
    }
    // Pass any other error along
    next(err);
  }
};

module.exports = registerUser;
