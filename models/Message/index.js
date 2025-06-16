const mongoose = require("mongoose");
const messageSchema = require("./MessageSchema");

// Prevent OverwriteModelError
const Message =  mongoose.model("Message", messageSchema);

module.exports = Message;
