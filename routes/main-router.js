const express = require("express");
const router = express.Router();

// Import controller functions
const {
  registerUser,
  loginUser,
  forgotPassword,
} = require("../controllers/auth-controller");

const { createRideRequest } = require("../controllers/ride-request-controller");

// Import validation schemas
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
} = require("../validators/auth-validator");
const { rideRequestSchema } = require("../validators/ride-request-validator");

// Import middleware for validating requests
const validateRequest = require("../middlewares/validator-middleware");

/* ========================== 👤 User Registration (Signup) ========================== */
/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/auth/register", validateRequest(signupSchema), registerUser);

/* ========================== 🔑 User Login ========================== */
/**
 * @route   POST /auth/login
 * @desc    Authenticate and log in a user using phone and password
 * @access  Public
 */
router.post("/auth/login", validateRequest(loginSchema), loginUser);

/* ========================== 🔄 Forgot Password ========================== */
/**
 * @route   POST /auth/forgot-password
 * @desc    Reset password using phone number
 * @access  Public
 */
router.post(
  "/auth/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

/* ========================== 🔄 Ride Request ========================== */
/**
 * @route   POST /auth/forgot-password
 * @desc    Reset password using phone number
 * @access  Public
 */
router.post(
  "/put/ride-request",
  validateRequest(rideRequestSchema),
  createRideRequest
);

module.exports = router;
// This router handles user authentication routes, including registration, login, and password reset.
// It uses validation middleware to ensure that incoming requests meet the expected schema.
// Each route is associated with a specific controller function that handles the logic for that route.
// The router is then exported for use in the main application file.
// This modular approach helps keep the code organized and maintainable.
// It allows for easy addition of new routes and controllers in the future.
// The use of middleware for validation ensures that the application can handle errors gracefully and provide meaningful feedback to users.
// This is particularly important for user authentication, where security and user experience are paramount.
// The router is designed to be easily integrated into an Express application, making it a flexible and reusable component.
// The use of async/await syntax in the controller functions allows for clean and readable asynchronous code, making it easier to handle errors and manage the flow of data.
// The router is structured to follow RESTful principles, making it intuitive for developers to understand and use.
// The use of environment variables for sensitive information, such as JWT secret keys, enhances security and allows for easy configuration in different environments.
// The router is designed to be easily extensible, allowing for the addition of new authentication-related routes in the future.
// The use of descriptive route names and HTTP methods follows best practices for RESTful API design, making the API intuitive and easy to use.
// The router is designed to be easily testable, allowing for unit and integration tests to be written for each route and controller function.
// This modular approach to routing and controller design promotes separation of concerns, making the codebase easier to maintain and understand.
