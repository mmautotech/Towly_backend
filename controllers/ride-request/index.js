// these two export the function directly:
const createRideRequest = require("./createRideRequest");
const postRideRequest = require("./postRideRequest");
const cancelRideRequest = require("./cancelRideRequest");
const acceptRideRequest = require("./acceptRideRequest");
const completeRideRequest = require("./completeRideRequest");

const getActiveRideRequestsByUser = require("./getActiveRideRequestsByUser");
const getDriverTrackingByClient = require("./getDriverTrackingByClient");
const getActiveServiceByTruck = require("./getActiveServiceByTruck");
const getAppliedRide_postedRequests = require("./getAppliedRideRequests");
const getUnappliedRide_postedRequests = require("./getUnappliedRideRequests");
const getTrackingInfoByUser = require("./getTrackingInfoByUser");

// Offers related
const getOffersForRideRequest = require("./getOffersForRideRequest");
const addOfferToRideRequest = require("./addOfferToRideRequest");
const addCounterOfferToRideRequest = require("./addCounterOfferToRideRequest");

module.exports = {
  createRideRequest,
  postRideRequest,
  cancelRideRequest,
  acceptRideRequest,
  completeRideRequest,

  getActiveRideRequestsByUser,
  getDriverTrackingByClient,
  getActiveServiceByTruck,

  getUnappliedRide_postedRequests,
  getAppliedRide_postedRequests,

  // Offers related
  getOffersForRideRequest,
  addOfferToRideRequest,
  addCounterOfferToRideRequest,

  getTrackingInfoByUser,
};
