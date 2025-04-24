const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const geoPointSchema = require("./geoPointSchema");

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\+44\d{10}$/, "Invalid phone format. Use: +44XXXXXXXXXX"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Prevent returning password in queries
  },
  role: {
    type: String,
    enum: ["admin", "truck", "client"],
    default: "client",
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  geolocation: geoPointSchema,
  created_at: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

// ✅ Index geolocation for geospatial queries
userSchema.index({ geolocation: "2dsphere" });

// ✅ Pre-save hook for hashing password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ✅ Method to compare entered password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Method to generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id.toString(),
      phone: this.phone,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );
};

module.exports = mongoose.model("User", userSchema);
