// models/index.js
const User = require("./user"); // user/index.js → mongoose.model('User', …)
const RideRequest = require("./ride-request"); // ride-request/index.js → mongoose.model('RideRequest', …)
const Message = require("./Message/Message");
module.exports = { User, RideRequest, Message };
