require('dotenv').config(); // <-- This loads your .env file!

const mongoose = require("mongoose");
const Wallet = require("./models/finance/wallet.schema");
const User = require("./models/user");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Find admin
  const admin = await User.findOne({ user_name: "Admin", role: "admin" });
  if (!admin) {
    console.error("No user found with name 'admin' and role 'admin'.");
    return;
  }

  // Create wallet if not exists
  let wallet = await Wallet.findOne({ user_id: admin._id });
  if (!wallet) {
    wallet = await Wallet.create({
      user_id: admin._id,
      balance: 0.0,
      currency: "GBP",
    });
    console.log("Wallet created for admin:", wallet._id);
  } else {
    console.log("admin already has a wallet:", wallet._id);
  }

  await mongoose.disconnect();
})();
