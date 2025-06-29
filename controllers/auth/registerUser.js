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
 *                 example: johndoe
 *               phone:
 *                 type: string
 *                 example: "03001234567"
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *               terms_agreed:
 *                 type: boolean
 *                 example: true
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created successfully.
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
 *         description: Validation error or duplicate entry
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
 *                   example: Invalid email format.
 */
const registerUser = async (req, res, next) => {
  try {
    const {
      user_name,
      phone,
      email,
      password,
      terms_agreed = true,
    } = req.body;

    if (terms_agreed === false) {
      return res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions to register.",
      });
    }

    if (!user_name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
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
        message: `${fieldName} already exists. Recover your account or Contact Towly@gmail.com`,
      });
    }

    next(err);
  }
};

module.exports = registerUser;
