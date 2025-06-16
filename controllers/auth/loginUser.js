const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @desc  🔑 Login User using phone and password
 * @route POST /auth/login
 * @access Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone }).select("+password");

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid phone number or password!" });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ message: "Your account has been blocked. Please contact Customer Support \n+443004311138." });
    }

    // Generate token and send success response
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