require('dotenv').config(); // <-- This loads your .env file!

const mongoose = require("mongoose");
const Wallet = require("./models/finance/wallet.schema");
const User = require("./models/user");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Find Bryan
  const bryan = await User.findOne({ user_name: "Bryan", role: "admin" });
  if (!bryan) {
    console.error("No user found with name 'bryan' and role 'admin'.");
    return;
  }

  // Create wallet if not exists
  let wallet = await Wallet.findOne({ user_id: bryan._id });
  if (!wallet) {
    wallet = await Wallet.create({
      user_id: bryan._id,
      balance: 0.0,
      currency: "GBP",
    });
    console.log("Wallet created for Bryan:", wallet._id);
  } else {
    console.log("Bryan already has a wallet:", wallet._id);
  }

  await mongoose.disconnect();
})();
