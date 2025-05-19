// routes/main-router.js
const express = require("express");
const router = express.Router();

// ─── MIDDLEWARES ───────────────────────────────────────────
const protect = require("../middlewares/auth-middleware");
const validateRequest = require("../middlewares/validator-middleware");
const upload = require("../middlewares/upload-middleware");
const authenticateToken = require("../middlewares/authenticateToken");

// ─── VALIDATORS ────────────────────────────────────────────
const {
  signup_schema,
  login_schema,
  forgot_password_schema,
} = require("../validators/auth-validator");
const {
  ride_request_schema,
  post_ride_schema,
  accept_ride_schema,
  cancel_ride_schema,
  get_offers_schema,
  get_single_truck_offer_schema,
  add_offer_schema,
  add_counter_offer_schema,
} = require("../validators/ride-request-validator");
const {
  update_client_profile_schema,
} = require("../validators/client-profile-validator");
const {
  update_driver_profile_schema,
  update_vehicle_profile_schema,
} = require("../validators/truck-profile-validator");
// ─── CONTROLLERS ───────────────────────────────────────────
const {
  getBasicUserInfo,
  getBasicTruckInfo,
  UpdateRatingClient,
  UpdateRatingVehicle,
  UpdateLocationVehicle,
  getClientProfile,
  updateClientProfile,
  getDriverProfile,
  updateDriverProfile,
  getVehicleProfile,
  updateVehicleProfile,
  updateSettings,
  getSettings,
} = require("../controllers/user");

// ─── AUTH ROUTES ───────────────────────────────────────────
//  ── CONTROLLERS ──
const {
  registerUser,
  loginUser,
  forgotPassword,
} = require("../controllers/auth");

router.post("/auth/register", validateRequest(signup_schema), registerUser);
router.post("/auth/login", validateRequest(login_schema), loginUser);
router.post(
  "/auth/forgot-password",
  validateRequest(forgot_password_schema),
  forgotPassword
);

// ─── RIDE REQUEST ROUTES ───────────────────────────────────
// ─── CONTROLLERS ───────────────────────────────────────────
const {
  createRideRequest,
  postRideRequest,
  cancelRideRequest,
  acceptRideRequest,
} = require("../controllers/ride-request");
// ─── POST to create a ride request ────────────────────────────
router.post(
  "/ride-request/create",
  validateRequest(ride_request_schema),
  createRideRequest
);

// ─── PATCH to update ride request status(4) ────────────────────
router.patch(
  "/ride-request/post",
  validateRequest(post_ride_schema),
  postRideRequest
);
router.patch(
  "/ride-request/accept",
  validateRequest(accept_ride_schema),
  acceptRideRequest
);
router.patch(
  "/ride-request/cancel",
  validateRequest(cancel_ride_schema),
  cancelRideRequest
);

// ─── GET to fetch ride requests ────────────────────────────
const {
  getActiveRideRequestsByUser,

  getUnappliedRide_postedRequests,
  getAppliedRide_postedRequests,
} = require("../controllers/ride-request");
// fetch the single active ride for the authenticated user
router.post(
  "/fetch/ride-requests/active",
  authenticateToken,
  getActiveRideRequestsByUser
);
// fetch the ride requests that are posted by the authenticated user
router.post(
  "/ride-requests/new",
  authenticateToken,
  getUnappliedRide_postedRequests
);
router.post(
  "/ride-requests/applied",
  authenticateToken,
  getAppliedRide_postedRequests
);

const {
  // Offers related
  getOffersForRideRequest,
  getSingleTruckOffer,
  addOfferToRideRequest,
  addCounterOfferToRideRequest,

  getHistoryClient,
  getHistoryTruck,
  getTrackingInfoByUser,
} = require("../controllers/ride-request");

router.get("/ride-requests/tracking/:user_id", getTrackingInfoByUser);

router.post(
  "/ride-request/offers",
  authenticateToken,
  validateRequest(get_offers_schema),
  getOffersForRideRequest
);
router.post(
  "/ride-request/truck-offer",
  validateRequest(get_single_truck_offer_schema),
  getSingleTruckOffer
);
router.post(
  "/ride-request/add-offer",
  validateRequest(add_offer_schema),
  addOfferToRideRequest
);
router.post(
  "/ride-request/counter-offer",
  validateRequest(add_counter_offer_schema),
  addCounterOfferToRideRequest
);

// ─── USER ROUTES (NEW) ────────────────────────────────────
// Basic info
router.post("/user", protect, getBasicUserInfo);
router.get("/truck", authenticateToken, getBasicTruckInfo);

// Ratings
router.post("/client/update-rating", authenticateToken, UpdateRatingClient);
router.post("/vehicle/update-rating", authenticateToken, UpdateRatingVehicle);

// Location
router.post(
  "/vehicle/update-location",
  authenticateToken,
  UpdateLocationVehicle
);
// ─── Client PROFILE ROUTES ────────────────────────────
// GET Client profile
router.get("/profile", authenticateToken, getClientProfile);
// PATCH client profile (text + 1 images)
router.patch(
  "/profile",
  authenticateToken,
  upload.single("profile_photo"),
  validateRequest(update_client_profile_schema),
  updateClientProfile
);

// ─── TRUCK PROFILE ROUTES ────────────────────────────
// GET driver profile
router.get("/profile/driver", protect, getDriverProfile);
// PATCH driver profile (text + 3 images)
router.patch(
  "/profile/driver",
  protect,
  upload.fields([
    { name: "license_Front", maxCount: 1 },
    { name: "license_Back", maxCount: 1 },
    { name: "license_Selfie", maxCount: 1 },
  ]),
  validateRequest(update_driver_profile_schema),
  updateDriverProfile
);

// ─── VEHICLE PROFILE ROUTES ─────────────────────────
// GET vehicle profile
router.get("/profile/vehicle", protect, getVehicleProfile);
// PATCH vehicle profile (1 image + text)
router.patch(
  "/profile/vehicle",
  protect,
  upload.single("vehiclePhoto"), // use this middleware
  validateRequest(update_vehicle_profile_schema), // optional
  updateVehicleProfile
);

// ─── Settings ROUTES ("/settings")─────────────────────────
// ─── POST to update either truck_settings or client_settings ────────────
router.post("/settings", updateSettings);
// ─── GET to fetch truck_settings or client_settings ────────────────────────────
router.get("/settings", getSettings);

// ─── History ROUTES ("/history")─────────────────────────
router.post("/ride-requests/history", getHistoryClient);
router.post("/ride-requests/history/truck", getHistoryTruck);

module.exports = router;
