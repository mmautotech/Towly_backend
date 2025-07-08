const mongoose = require("mongoose");
const { RideRequest } = require("../models");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // IPv4 (keep if you need IPv4-only)
      serverSelectionTimeoutMS: 10000,
      // You can add more options if needed, but don't include deprecated ones
    });

    await RideRequest.syncIndexes();
    console.log("✅ Connected to Local MongoDB");
  } catch (error) {
    console.error("❌ Local DB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
