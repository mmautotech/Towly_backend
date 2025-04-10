const express = require("express");
const router = express.Router();

// Controllers
const {
  registerUser,
  loginUser,
  forgotPassword,
} = require("../controllers/auth-controller");

const {
  createRideRequest,
  getActiveRideRequestsByUser,
  postRideRequest,
  getAllPostedRideRequests,
} = require("../controllers/ride-request-controller");

const { postOffer } = require("../controllers/offer-controller");

// Validators
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
} = require("../validators/auth-validator");

const {
  rideRequestSchema,
  getCreatedByUserSchema,
} = require("../validators/ride-request-validator");

// Middleware
const validateRequest = require("../middlewares/validator-middleware");

/* ========== AUTH ROUTES ========== */
router.post("/auth/register", validateRequest(signupSchema), registerUser);
router.post("/auth/login", validateRequest(loginSchema), loginUser);
router.post(
  "/auth/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

/* ========== RIDE REQUEST ROUTES ========== */
router.post(
  "/create/ride-request",
  validateRequest(rideRequestSchema),
  createRideRequest
);
router.post(
  "/fetch/ride-requests/active",
  validateRequest(getCreatedByUserSchema),
  getActiveRideRequestsByUser
);
router.patch(
  "/ride-request/post",
  validateRequest(getCreatedByUserSchema),
  postRideRequest
);

router.get("/ride-requests/posted", getAllPostedRideRequests);

router.post("/ride-request/offer", postOffer);

module.exports = router;
// The above code is a router module for an Express.js application that handles authentication and ride request routes. It imports necessary modules, defines routes for user registration, login, password recovery, and ride request creation and retrieval, and applies validation middleware to ensure that incoming requests meet the expected schema before being processed by the corresponding controller functions.
