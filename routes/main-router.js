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
  getUnappliedRide_postedRequests,
  getAppliedRide_postedRequests,
  getOffersForRideRequest,
  getSingleTruckOffer,
  addOfferToRideRequest,
  addCounterOfferToRideRequest,
  getHistoryClient,
  getHistoryTruck,
  getTrackingInfoByUser,
} = require("../controllers/ride-request");

// Add messaging controllers
const {
  sendMessage,
  getMessagesByUser,
  markMessageRead,
  getConversationBetweenUsers,
} = require("../controllers/message/message");

// ─── AUTH ROUTES ───────────────────────────────────────────
router.post("/auth/register", validateRequest(signup_schema), registerUser);
router.post("/auth/login", validateRequest(login_schema), loginUser);
router.post(
  "/auth/forgot-password",
  validateRequest(forgot_password_schema),
  forgotPassword
);

// ─── RIDE REQUEST ROUTES ───────────────────────────────────
router.post(
  "/ride-request/create",
  validateRequest(ride_request_schema),
  createRideRequest
);

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

router.post(
  "/fetch/ride-requests/active",
  authenticateToken,
  getActiveRideRequestsByUser
);
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
router.post("/user", protect, getBasicUserInfo);
router.get("/truck", authenticateToken, getBasicTruckInfo);

router.post("/client/update-rating", authenticateToken, UpdateRatingClient);
router.post("/vehicle/update-rating", authenticateToken, UpdateRatingVehicle);

router.post(
  "/vehicle/update-location",
  authenticateToken,
  UpdateLocationVehicle
);

// ─── Client PROFILE ROUTES ────────────────────────────
router.get("/profile", authenticateToken, getClientProfile);
router.patch(
  "/profile",
  authenticateToken,
  upload.single("profile_photo"),
  validateRequest(update_client_profile_schema),
  updateClientProfile
);

// ─── TRUCK PROFILE ROUTES ────────────────────────────
router.get("/profile/driver", protect, getDriverProfile);
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
router.get("/profile/vehicle", protect, getVehicleProfile);
router.patch(
  "/profile/vehicle",
  protect,
  upload.single("vehiclePhoto"),
  validateRequest(update_vehicle_profile_schema),
  updateVehicleProfile
);

// ─── Settings ROUTES ("/settings")─────────────────────────
router.post("/settings", updateSettings);
router.get("/settings", getSettings);

// ─── History ROUTES ("/history")─────────────────────────
router.post("/ride-requests/history", getHistoryClient);
router.post("/ride-requests/history/truck", getHistoryTruck);

// ─── MESSAGING ROUTES ───────────────────────────────────────

// Send a new message
router.post(
  "/messages/send",
  sendMessage
);

// Get all messages for a specific user
router.get(
  "/messages/user/:userId",
  getMessagesByUser
);

// Mark a message as read
router.patch(
  "/messages/:messageId/read",
  markMessageRead
);

// Get conversation between two users
router.get(
  "/messages/conversation/:userId1/:userId2",
  getConversationBetweenUsers
);

module.exports = router;
