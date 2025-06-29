module.exports = {
  // get Stats
  getStats: require("../admin/getStats"),

  // get All Clients & Trucks
  getAllClients: require("./getAllClients"),
  getAllTrucker: require("./getAllTrucker"),
  getAllRideRequest: require("./getAllRideRequest"),
  getWallets: require("../admin/getWallets"),
  getTransactions: require("../admin/getTransactions"),

  getConversation: require("./getMessages" ),
 

  // Update user Phone or status
  updateUserPhone: require("./updateUserPhone"),
  updateUserStatus: require("./updateUserStatus"),
  updateTransactionStatus: require("../admin/updateTransactionStatus"),


};
