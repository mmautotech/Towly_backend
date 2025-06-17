// routes/main-router.js
const express = require("express");
const router = express.Router();

// ─── MIDDLEWARES ───────────────────────────────────────────
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const validateRequest   = require("../middlewares/validator-middleware");
const upload            = require("../middlewares/upload-middleware");

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
  add_offer_schema,
  add_counter_offer_schema,
} = require("../validators/ride-request-validator");

const { update_client_profile_schema } = require("../validators/client-profile-validator");
const {
  update_driver_profile_schema,
  update_vehicle_profile_schema,
} = require("../validators/truck-profile-validator");

// ─── CONTROLLERS ───────────────────────────────────────────
const {
  getBasicUserInfo,
  getBasicTruckInfo,

  getAllClients,
  getAllTrucker,
  getUserStats,
  updateUserPhone, 
  updateStatus,

  UpdateRatingClient,
  UpdateRatingVehicle,
  UpdateLocationVehicle,
  getClientProfile,
  updateClientProfile,
  getDriverProfile,
  updateDriverProfile,
  getVehicleProfile,
  updateVehicleProfile,
  getSettings,
  updateSettings
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
  getDriverTrackingByClient,
  getActiveServiceByTruck, 

  getUnappliedRide_postedRequests,
  getAppliedRide_postedRequests,
  getAllRideRequest,

  // Offers related
  getOffersForRideRequest,
  addOfferToRideRequest,
  addCounterOfferToRideRequest,

  getHistoryClient,
  getHistoryTruck,
  getTrackingInfoByUser,
} = require("../controllers/ride-request");

const finance = require("../controllers/finance");

const {
  sendMessage,
  getChat,
  markMessageRead,
  deleteMessage,
} = require("../controllers/message");

// ─── AUTH ROUTES ───────────────────────────────────────────
router.post("/auth/register",        validateRequest(signup_schema),         registerUser);
router.post("/auth/login",           validateRequest(login_schema),          loginUser);
router.post("/auth/forgot-password", validateRequest(forgot_password_schema), forgotPassword);

// ─── RIDE REQUEST ROUTES ───────────────────────────────────
router.post(
  "/ride-request/create",
  authenticateToken,
  validateRequest(ride_request_schema),
  createRideRequest
);
router.patch(
  "/ride-request/post",
  authenticateToken,
  validateRequest(post_ride_schema),
  postRideRequest
);
router.patch(
  "/ride-request/accept",
  authenticateToken,
  validateRequest(accept_ride_schema),
  acceptRideRequest
);
router.patch(
  "/ride-request/cancel",
  authenticateToken,
  validateRequest(cancel_ride_schema),
  cancelRideRequest
);
router.get(
  "/fetch/ride-requests/active",
  authenticateToken,
  getActiveRideRequestsByUser
);
router.get(
  "/ride-requests/new",
  authenticateToken,
  getUnappliedRide_postedRequests
);
router.get(
  "/ride-requests/applied",
  authenticateToken,
  getAppliedRide_postedRequests
);
router.get('/ride-requests/getAll', getAllRideRequest);

router.get("/ride-requests/tracking/:user_id", getTrackingInfoByUser);

// ─── GET Driver Tracking FOR TRUCK ─────────────────────────
router.get(
  "/ride-requests/truck/tracking",
  authenticateToken,
  getDriverTrackingByClient
);
// ─── GET ACTIVE SERVICE FOR TRUCK ─────────────────────────
router.get(
  "/ride-requests/active/truck",
  authenticateToken,
  getActiveServiceByTruck
);

router.post(
  "/ride-request/offers",
  authenticateToken,
  validateRequest(get_offers_schema),
  getOffersForRideRequest
);
router.patch(
  "/ride-request/add-offer",
  authenticateToken,
  validateRequest(add_offer_schema),
  addOfferToRideRequest
);

router.patch(
  "/ride-request/counter-offer",
  authenticateToken,
  validateRequest(add_counter_offer_schema),
  addCounterOfferToRideRequest
);

// ─── USER ROUTES ────────────────────────────────────────────
router.post("/user",                    authenticateToken, getBasicUserInfo);
router.get( "/truck",                  authenticateToken, getBasicTruckInfo);
router.post("/client/update-rating",   authenticateToken, UpdateRatingClient);
router.post("/vehicle/update-rating",  authenticateToken, UpdateRatingVehicle);
router.post("/vehicle/update-location",authenticateToken, UpdateLocationVehicle);

router.get("/user_profiles/AllClient", authenticateToken, isAdmin, getAllClients);
router.get("/user_profiles/AllTrucker", authenticateToken, isAdmin, getAllTrucker);
router.get('/user_profiles/stats', authenticateToken, isAdmin, getUserStats);
router.put('/update-phone/:userId', authenticateToken, isAdmin, updateUserPhone);
router.patch('/block/:userId', authenticateToken, isAdmin, updateStatus);

// ─── CLIENT PROFILE ROUTES ────────────────────────────────
router.get(
  "/profile",
  authenticateToken,
  getClientProfile
);
router.patch(
  "/profile",
  authenticateToken,
  upload.single("profile_photo"),
  validateRequest(update_client_profile_schema),
  updateClientProfile
);

// ─── DRIVER PROFILE ROUTES ───────────────────────────────
router.get(
  "/profile/driver",
  authenticateToken,
  getDriverProfile
);
router.patch(
  "/profile/driver",
  authenticateToken,
  upload.fields([
    { name: "license_Front", maxCount: 1 },
    { name: "license_Back",  maxCount: 1 },
    { name: "license_Selfie", maxCount: 1 },
  ]),
  validateRequest(update_driver_profile_schema),
  updateDriverProfile
);

// ─── VEHICLE PROFILE ROUTES ──────────────────────────────
router.get(
  "/profile/vehicle",
  authenticateToken,
  getVehicleProfile
);
router.patch(
  "/profile/vehicle",
  authenticateToken,
  upload.single("vehiclePhoto"),
  validateRequest(update_vehicle_profile_schema),
  updateVehicleProfile
);

// ─── HISTORY ROUTES ───────────────────────────────────────
router.get(
  "/ride-requests/history",
  authenticateToken,
  getHistoryClient
);
router.get(
  "/ride-requests/history/truck",
  authenticateToken,
  getHistoryTruck
);

// ─── SETTINGS ROUTES ──────────────────────────────────────
router.get(
  "/user/settings",
  authenticateToken,
  getSettings
);
router.get(
  "/user/settings/update",
  authenticateToken,
  updateSettings
);

// ─── MESSAGING ROUTES ────────────────────────────────────
router.get(   "/messages",             authenticateToken, getChat);
router.post(  "/message/send",  authenticateToken, sendMessage);
router.patch( "/message/read/:id",     authenticateToken, markMessageRead);
router.patch( "/message/delete/:id",   authenticateToken, deleteMessage);

// ─── Financial ROUTES ────────────────────────────────────
// User Routes
router.post("/wallet/credit", authenticateToken, finance.creditWallet);
router.post("/wallet/debit", authenticateToken, finance.debitWallet);
router.get("/wallet/balance", authenticateToken, finance.getWalletBalance);
router.get("/wallet/transactions", authenticateToken, finance.getTransactionLog);

// Admin Routes
// ✅ Admin-only: Update Transaction Status
router.patch("/transaction/:transactionId/status", authenticateToken, isAdmin, finance.updateTransactionStatus);
// ✅ Admin-only: View All Wallets
router.get("/admin/wallets", authenticateToken, isAdmin, finance.getAllWallets);
// ✅ Admin-only: View All Transactions
router.get("/admin/transactions", authenticateToken, isAdmin, finance.getAllTransactions);

module.exports = router;