const express = require("express");
const router = express.Router();

// ======================= CONTROLLERS ======================= //
const {
  registerUser,
  loginUser,
  forgotPassword,
} = require("../controllers/auth");

const {
  createRideRequest,
  postRideRequest,
  cancelRideRequest,
  acceptRideRequest,
  getActiveRideRequestsByUser,
  getNearbyRideRequests,
  getAppliedRide_postedRequests,
  getAcceptedRide_postedRequests, // <-- Updated controller
  getUnappliedRide_postedRequests,
  getOffersForRideRequest,
  getSingleTruckOffer,
  addOfferToRideRequest,
  addCounterOfferToRideRequest,
  getcompletedRide,
} = require("../controllers/ride-request");

const { updateUserLocation, updateUserRating } = require("../controllers/user");

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
  acceptRideSchema,
  cancelRideSchema,
  geoPointSchema,
  getOffersSchema,
  getSingleTruckOfferSchema,
  addOfferSchema,
  addCounterOfferSchema,
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
router.post(
  "/create/ride-request",
  validateRequest(rideRequestSchema),
  createRideRequest
);
router.patch(
  "/ride-request/cancel",
  validateRequest(cancelRideSchema),
  cancelRideRequest
);
router.patch(
  "/ride-request/post",
  validateRequest(postRideSchema),
  postRideRequest
);
router.patch(
  "/ride-request/accept",
  validateRequest(acceptRideSchema),
  acceptRideRequest
);
router.post(
  "/fetch/ride-requests/active",
  validateRequest(getCreatedByUserSchema),
  getActiveRideRequestsByUser
);

// Route to get both applied and accepted requests (Updated to use new controller)
router.post("/ride-requests/applied", getAppliedRide_postedRequests); // <-- Updated
router.post("/ride-requests/accepted", getAcceptedRide_postedRequests);
// Route to get newly posted requests (still the same)
router.post("/ride-requests/new", getUnappliedRide_postedRequests);
router.post("/ride-requests/nearby", getNearbyRideRequests);
router.post("/ride-requests/completed", getcompletedRide),
  router.post(
    "/ride-request/offers",
    validateRequest(getOffersSchema),
    getOffersForRideRequest
  );
router.post(
  "/ride-request/truck-offer",
  validateRequest(getSingleTruckOfferSchema),
  getSingleTruckOffer
);
router.post(
  "/ride-request/add-offer",
  validateRequest(addOfferSchema),
  addOfferToRideRequest
);
router.post(
  "/ride-request/counter-offer",
  validateRequest(addCounterOfferSchema),
  addCounterOfferToRideRequest
);

// ======================= USER ROUTES (NEW) ======================= //
router.post("/user/update-location", updateUserLocation);
router.post("/user/update-rating", updateUserRating);

module.exports = router;
