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

// ======================= MIDDLEWARE ======================= //
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

router.post("/ride-request/add-offer", addOfferToRideRequest); // Expects: request_id, truck_id, offered_price

// ======================= EXPORT ROUTER ======================= //
module.exports = router;
