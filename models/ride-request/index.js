const mongoose = require("mongoose");
const rideRequestSchema = require("./rideRequestSchema");

module.exports = mongoose.model("RideRequest", rideRequestSchema);
