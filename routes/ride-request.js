const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const validateRequest = require("../middlewares/validator-middleware");

const {
  ride_request_schema,
  post_ride_schema,
  accept_ride_schema,
  cancel_ride_schema,
  get_offers_schema,
  add_offer_schema,
  add_counter_offer_schema,
} = require("../validators/ride-request-validator");

const {
  createRideRequest,
  postRideRequest,
  cancelRideRequest,
  acceptRideRequest,
  getActiveRideRequestsByUser,
  getUnappliedRide_postedRequests,
  getAppliedRide_postedRequests,
  getOffersForRideRequest,
  addOfferToRideRequest,
  addCounterOfferToRideRequest,
  getTrackingInfoByUser,
  getDriverTrackingByClient,
  getActiveServiceByTruck,
} = require("../controllers/ride-request");

router.post("/ride-request/create", authenticateToken, validateRequest(ride_request_schema), createRideRequest);
router.patch("/ride-request/post", authenticateToken, validateRequest(post_ride_schema), postRideRequest);
router.patch("/ride-request/cancel", authenticateToken, validateRequest(cancel_ride_schema), cancelRideRequest);

// check before making an offer allow only if balance exist & status is not blocked
router.post("/ride-request/offers", authenticateToken, validateRequest(get_offers_schema), getOffersForRideRequest);
router.patch("/ride-request/add-offer", authenticateToken, validateRequest(add_offer_schema), addOfferToRideRequest);
router.patch("/ride-request/counter-offer", authenticateToken, validateRequest(add_counter_offer_schema), addCounterOfferToRideRequest);

router.patch("/ride-request/accept", authenticateToken, validateRequest(accept_ride_schema), acceptRideRequest);

router.get("/fetch/ride-requests/active", authenticateToken, getActiveRideRequestsByUser);
router.get("/ride-requests/new", authenticateToken, getUnappliedRide_postedRequests);
router.get("/ride-requests/applied", authenticateToken, getAppliedRide_postedRequests);


router.get("/ride-requests/tracking/:user_id", getTrackingInfoByUser);
router.get("/ride-requests/truck/tracking", authenticateToken, getDriverTrackingByClient);
router.get("/ride-requests/active/truck", authenticateToken, getActiveServiceByTruck);


module.exports = router;
