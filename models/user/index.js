// models/user/index.js
const mongoose = require("mongoose");
const user_schema = require("./user.schema");

const User = mongoose.model("User", user_schema); // attach methods
module.exports = User;
