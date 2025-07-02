require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/user");
const Wallet = require("./models/finance/wallet.schema");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // 👉 Pre-create the Wallet collection if it doesn't exist
    const collections = await mongoose.connection.db.listCollections({ name: "wallets" }).toArray();
    if (collections.length === 0) {
      await mongoose.connection.db.createCollection("wallets");
      console.log("📦 'wallets' collection created.");
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // ---------- 1. Create Admin User ----------
      let admin = await User.findOne({ user_name: "Admin", role: "admin" }).session(session);
      if (!admin) {
        admin = new User({
          user_name: "Admin",
          phone: "+440123456789",
          email: "admin@towly.com",
          role: "admin",
          password: "Admin@123",
          status: "active",
        });
        await admin.save({ session });
        console.log("✅ Admin user created:", admin._id);
      } else {
        console.log("✅ Admin user already exists:", admin._id);
      }

      // ---------- 2. Create System Reserve User ----------
      let reserveUser = await User.findOne({ user_name: "Debit_Reserve", role: "admin" }).session(session);
      if (!reserveUser) {
        reserveUser = new User({
          user_name: "Debit_Reserve",
          phone: "+440000000000",
          email: "debit_reserve@towly.com",
          role: "admin",
          password: "System@123",
          status: "active",
        });
        await reserveUser.save({ session });
        console.log("✅ System Reserve user created:", reserveUser._id);
      } else {
        console.log("✅ System Reserve user already exists:", reserveUser._id);
      }

      // ---------- 3. Create Admin Wallet ----------
      let adminWallet = await Wallet.findOne({ user_id: admin._id }).session(session);
      if (!adminWallet) {
        adminWallet = new Wallet({
          user_id: admin._id,
          balance: 0,
          currency: "GBP",
        });
        await adminWallet.save({ session });
        console.log("💰 Admin wallet created:", adminWallet._id);
      } else {
        console.log("💰 Admin wallet already exists:", adminWallet._id);
      }

      // ---------- 4. Create System Reserve Wallet ----------
      let reserveWallet = await Wallet.findOne({ user_id: reserveUser._id }).session(session);
      if (!reserveWallet) {
        reserveWallet = new Wallet({
          user_id: reserveUser._id,
          balance: 100000,
          currency: "GBP",
        });
        await reserveWallet.save({ session });
        console.log("💰 System Reserve wallet created with balance 100000:", reserveWallet._id);
      } else {
        console.log("💰 System Reserve wallet already exists:", reserveWallet._id);
      }

      await session.commitTransaction();
      console.log("✅ All operations committed.");
    } catch (err) {
      console.error("❌ Transaction aborted due to error:", err.message);
      await session.abortTransaction();
    } finally {
      session.endSession();
      await mongoose.disconnect();
      console.log("🔌 Connection closed.");
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
})();
