const mongoose = require("mongoose");
const { RideRequest } = require("../models");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // IPv4
      serverSelectionTimeoutMS: 10000,
    });

    await RideRequest.syncIndexes();
    console.log("✅ Connected to Local MongoDB");
  } catch (error) {
    console.error("❌ Local DB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
