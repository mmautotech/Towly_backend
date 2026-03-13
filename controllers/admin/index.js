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
/*
PORT=5000

MONGO_URI=mongodb+srv://mmautotechapp_db_user:MmAutoTechApp123321@cluster0.0iohdvp.mongodb.net/Towly_DB?retryWrites=true&w=majority

JWT_SECRET_KEY=a61330be8552f53ab930a0f2198c157b486863da0d3d354760e26766d782e546


*/
