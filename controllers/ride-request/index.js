const acceptRideRequest = require("./acceptRideRequest");
const getAcceptedRide_postedRequests = require("./getAcceptedRideRequests");


module.exports = {
  createRideRequest: require("./createRideRequest"),
  postRideRequest: require("./postRideRequest"),
  cancelRideRequest: require("./cancelRideRequest"),
  acceptRideRequest: require("./acceptRideRequest"),
  getActiveRideRequestsByUser: require("./getActiveRideRequestsByUser"),
  getNearbyRideRequests: require("./getNearbyRideRequests"),
  getAppliedRide_postedRequests: require("./getAppliedRideRequests"),
  getAcceptedRide_postedRequests: require("./getAcceptedRideRequests"),
  getUnappliedRide_postedRequests: require("./getUnappliedRideRequests"),
  getcompletedRide: require("./getCompletedRideRequest"),
  // Offers related
  getOffersForRideRequest: require("./getOffersForRideRequest"),
  getSingleTruckOffer: require("./getSingleTruckOffer"),
  addOfferToRideRequest: require("./addOfferToRideRequest"),
  addCounterOfferToRideRequest: require("./addCounterOfferToRideRequest"),
};
