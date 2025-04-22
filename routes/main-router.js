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
  postRideRequest,
  cancelRideRequest,
  getActiveRideRequestsByUser,
  addOfferToRideRequest,
  getNearbyRideRequests,
  getAppliedRide_postedRequests,
  getUnappliedRide_postedRequests,
  getOffersForRideRequest,
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
  postRideSchema,
  addOfferSchema,
  getOffersSchema,
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
  validateRequest(postRideSchema),
  postRideRequest
);

// ✅ Cancel ride request status.
router.patch("/ride-request/cancel", cancelRideRequest);

// ✅ Get all applied & new ride requests (public)
router.post("/ride-requests/applied", getAppliedRide_postedRequests);
router.post("/ride-requests/new", getUnappliedRide_postedRequests);

// ✅ Add offer to a ride request (driver side)
router.post(
  "/ride-request/add-offer",
  validateRequest(addOfferSchema),
  addOfferToRideRequest
);

// ✅ Get nearby ride requests based on location
router.post("/ride-requests/nearby", getNearbyRideRequests);

router.post(
  "/ride-request/offers",
  validateRequest(getOffersSchema),
  getOffersForRideRequest
);

module.exports = router;
