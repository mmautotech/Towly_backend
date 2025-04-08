const mongoose = require("mongoose");

// Connect to MongoDB Atlas
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      tls: true, // Enforce TLS for secure connection
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      family: 4, // Force IPv4
    });

    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDb;
