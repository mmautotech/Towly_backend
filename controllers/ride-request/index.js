// these two export the function directly:
const createRideRequest = require("./createRideRequest");
const postRideRequest = require("./postRideRequest");
const cancelRideRequest = require("./cancelRideRequest");
const acceptRideRequest = require("./acceptRideRequest");

const getActiveRideRequestsByUser = require("./getActiveRideRequestsByUser");
const getNearbyRideRequests = require("./getNearbyRideRequests");
const getAppliedRide_postedRequests = require("./getAppliedRideRequests");
const getAcceptedRide_postedRequests = require("./getAcceptedRideRequests");
const getUnappliedRide_postedRequests = require("./getUnappliedRideRequests");
const getcompletedRide = require("./getCompletedRideRequest");
const getCompletedRideTruck = require("./getCompletedRideRequestTruck");
const getTrackingInfoByUser = require("./getTrackingInfoByUser");

// Offers related
const getOffersForRideRequest = require("./getOffersForRideRequest");
const getSingleTruckOffer = require("./getSingleTruckOffer");
const addOfferToRideRequest = require("./addOfferToRideRequest");
const addCounterOfferToRideRequest = require("./addCounterOfferToRideRequest");

module.exports = {
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
  getCompletedRideTruck,
  getTrackingInfoByUser,
  // Offers related
  getOffersForRideRequest,
  getSingleTruckOffer,
  addOfferToRideRequest,
  addCounterOfferToRideRequest,
};
