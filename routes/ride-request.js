const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const validateRequest = require("../middlewares/validator-middleware");

const {
  ride_request_schema,

  post_ride_schema,
  accept_ride_schema,
  reopen_ride_schema,
  cancel_ride_schema,
  complete_ride_schema,

  get_offers_schema,
  add_offer_schema,
  add_counter_offer_schema,
} = require("../validators/ride-request-validator");

const {
  createRideRequest,
  postRideRequest,
  cancelRideRequest,
  acceptRideRequest,
  reopenRideRequest,
  completeRideRequest,

  addOfferToRideRequest,
  addCounterOfferToRideRequest,

  getOffersForRideRequest,

  getActiveRideRequestsByUser,
  getTrackingInfoByUser,
  getDriverTrackingByClient,
  getActiveServiceByTruck,
} = require("../controllers/ride-request");

router.post(
  "/create",
  authenticateToken,
  validateRequest(ride_request_schema),
  createRideRequest
);
router.patch(
  "/post",
  authenticateToken,
  validateRequest(post_ride_schema),
  postRideRequest
);
router.patch(
  "/cancel",
  authenticateToken,
  validateRequest(cancel_ride_schema),
  cancelRideRequest
);
router.patch(
  "/accept",
  authenticateToken,
  validateRequest(accept_ride_schema),
  acceptRideRequest
);
router.patch(
  "/re-open",
  authenticateToken,
  validateRequest(reopen_ride_schema),
  reopenRideRequest
);
router.post(
  "/complete",
  authenticateToken,
  validateRequest(complete_ride_schema),
  completeRideRequest
);

// check before making an offer allow only if balance exist & status is not blocked
router.post(
  "/offers",
  authenticateToken,
  validateRequest(get_offers_schema),
  getOffersForRideRequest
);
router.patch(
  "/add-offer",
  authenticateToken,
  validateRequest(add_offer_schema),
  addOfferToRideRequest
);
router.patch(
  "/counter-offer",
  authenticateToken,
  validateRequest(add_counter_offer_schema),
  addCounterOfferToRideRequest
);

router.get("/fetch-active", authenticateToken, getActiveRideRequestsByUser);

router.get(
  "/fetch-truck/tracking",
  authenticateToken,
  getDriverTrackingByClient
);
router.get("/fetch-active/truck", authenticateToken, getActiveServiceByTruck);
router.get("/fetch-tracking/:user_id", getTrackingInfoByUser);

module.exports = router;
