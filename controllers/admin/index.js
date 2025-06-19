module.exports = {
  // get Stats
  getStats: require("../admin/getStats"),

  // get All Clients & Trucks
  getAllClients: require("./getAllClients"),
  getAllTrucker: require("./getAllTrucker"),
  getAllRideRequest: require("./getAllRideRequest"),

  // Update user Phone or status
  updateUserPhone: require("./updateUserPhone"),
  updateUserStatus: require("./updateUserStatus"),
};
