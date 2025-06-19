module.exports = {
  // Client Api
  debitWallet: require("./debitWallet"),

  // Truck Apis
  creditWallet: require("./creditWallet"),
  getWalletBalanceByUser: require("./getWalletBalanceByUser"),
  getTransactionByUser: require("./getTransactionByUser"),

  // Admin Apis
  getWallets: require("./getWallets"),
  getTransactions: require("./getTransactions"),
  updateTransactionStatus: require("./updateTransactionStatus"),
};
