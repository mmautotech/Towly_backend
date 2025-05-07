// controllers/auth/index.js
const registerUser = require("./registerUser");
const loginUser = require("./loginUser");
const forgotPassword = require("./forgotPassword");

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
};
