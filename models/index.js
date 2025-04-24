module.exports = {
  User: require("./user/userSchema"), // ✅ Now correctly linked
  RideRequest: require("./ride-request"), // Your modular rideRequest model
};
