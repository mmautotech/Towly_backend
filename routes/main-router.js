const express = require("express");
const router = express.Router();

// ======================= CONTROLLERS ======================= //
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
  addOfferToRideRequest,
  getNearbyRideRequests,
} = require("../controllers/ride-request-controller");

// ======================= VALIDATORS ======================= //
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
} = require("../validators/auth-validator");

const {
  rideRequestSchema,
  getCreatedByUserSchema,
} = require("../validators/ride-request-validator");

const validateRequest = require("../middlewares/validator-middleware");

// ======================= AUTH ROUTES ======================= //
router.post("/auth/register", validateRequest(signupSchema), registerUser);
router.post("/auth/login", validateRequest(loginSchema), loginUser);
router.post(
  "/auth/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

// ======================= RIDE REQUEST ROUTES ======================= //

// ✅ Create a new ride request
router.post(
  "/create/ride-request",
  validateRequest(rideRequestSchema),
  createRideRequest
);

// ✅ Get user's active ride requests
router.post(
  "/fetch/ride-requests/active",
  validateRequest(getCreatedByUserSchema),
  getActiveRideRequestsByUser
);

// ✅ Change ride request status to posted
router.patch(
  "/ride-request/post",
  validateRequest(getCreatedByUserSchema),
  postRideRequest
);

// ✅ Get all posted ride requests (public)
router.get("/ride-requests/posted", getAllPostedRideRequests);

// ✅ Add offer to a ride request (driver side)
router.post("/ride-request/add-offer", addOfferToRideRequest);

// ✅ Get nearby ride requests based on location
router.post("/ride-requests/nearby", getNearbyRideRequests);

module.exports = router;
