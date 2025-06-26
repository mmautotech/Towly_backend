const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new client user
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
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               terms_agreed:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User registered successfully with token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Email or phone already exists
 */
const registerUser = async (req, res, next) => {
  try {
    const {
      user_name,
      phone,
      email,
      password,
      terms_agreed = true // fallback to true if not provided
    } = req.body;

    // Optional: Check explicitly if user denied terms
    if (terms_agreed === false) {
      return res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions to register.",
      });
    }

    const newUser = new User({
      user_name,
      phone,
      email,
      password,
      role: "client",
      status: "active",
      terms_agreed,
    });

    await newUser.save();

    const token = newUser.generateToken();

    sendSuccessResponse(res, "User created successfully.", {
      token,
      user_id: newUser._id,
      role: newUser.role,
    });
  } catch (err) {
    if (err.code === 11000) {
      const dupField = Object.keys(err.keyValue)[0];
      const fieldName = dupField === "phone" ? "Phone number" : "Email";
      return res.status(400).json({
        success: false,
        message: `${fieldName} already exists.`,
      });
    }

    next(err);
  }
};

module.exports = registerUser;
