// routes/main-router.js
const express = require("express");
const router = express.Router();

// ─── MIDDLEWARES ───────────────────────────────────────────
const protect = require("../middlewares/auth-middleware");
const validateRequest = require("../middlewares/validator-middleware");
const upload = require("../middlewares/upload-middleware");

// ─── VALIDATORS ────────────────────────────────────────────
const {
  signup_schema,
  login_schema,
  forgot_password_schema,
} = require("../validators/auth-validator");
const {
  ride_request_schema,
  get_created_by_user_schema,
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
  getAcceptedRide_postedRequests,
  getUnappliedRide_postedRequests,
  getcompletedRide,
  // Offers related
  getOffersForRideRequest,
  getSingleTruckOffer,
  addOfferToRideRequest,
  addCounterOfferToRideRequest,
} = require("../controllers/ride-request");
const {
  updateUserLocation,
  updateUserRating,
  getClientProfile,
  updateClientProfile,
  getDriverProfile,
  updateDriverProfile,
  getVehicleProfile,
  updateVehicleProfile,
} = require("../controllers/user");
const { get } = require("../models/user/image.schema");

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
  "/create/ride-request",
  validateRequest(ride_request_schema),
  createRideRequest
);
router.patch(
  "/ride-request/cancel",
  validateRequest(cancel_ride_schema),
  cancelRideRequest
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
router.post(
  "/fetch/ride-requests/active",
  validateRequest(get_created_by_user_schema),
  getActiveRideRequestsByUser
);

router.post("/ride-requests/applied", getAppliedRide_postedRequests);
router.post("/ride-requests/accepted", getAcceptedRide_postedRequests);
router.post("/ride-requests/new", getUnappliedRide_postedRequests);
router.post("/ride-requests/nearby", getNearbyRideRequests);
router.post("/ride-requests/completed", getcompletedRide);

router.post(
  "/ride-request/offers",
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
router.post("/user/update-location", updateUserLocation);
router.post("/user/update-rating", updateUserRating);

router.get("/client/profile", protect, getClientProfile);
router.patch(
  "/client/profile",
  protect,
  upload.single("profile_photo"), // <-- handle multipart
  validateRequest(update_client_profile_schema),
  updateClientProfile
);

// ─── TRUCK PROFILE ROUTES ────────────────────────────
// GET driver profile
// GET driver profile
router.get("/driver/profile", protect, getDriverProfile);

// PATCH driver profile (text + 3 images)
router.patch(
  "/driver/profile",
  protect,
  upload.fields([
    { name: "licenseFront", maxCount: 1 },
    { name: "licenseBack", maxCount: 1 },
    { name: "licenseSelfie", maxCount: 1 },
  ]),
  validateRequest(update_driver_profile_schema),
  updateDriverProfile
);

// ─── VEHICLE PROFILE ROUTES ─────────────────────────
// GET vehicle profile
router.get(
  "/vehicle/profile",
  protect,
  getVehicleProfile // fetches via User.truckProfile.vehicleProfile :contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}
);

// PATCH vehicle profile (1 image + text)
router.patch(
  "/vehicle/profile",
  protect,
  upload.single("vehiclePhoto"),
  validateRequest(update_vehicle_profile_schema),
  updateVehicleProfile // updates & reuses getVehicleProfile :contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}
);

module.exports = router;
