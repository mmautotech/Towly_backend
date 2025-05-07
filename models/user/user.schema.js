// models/user/user.schema.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const client_profile_schema = require("./clientProfile.schema");
const driver_profile_schema = require("./driverProfile.schema");
const vehicle_profile_schema = require("./vehicleProfile.schema");
const geo_point_schema = require("./geoPoint.schema");

const user_schema = new mongoose.Schema(
  {
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
      select: false,
    },
    role: {
      type: String,
      enum: ["client", "driver", "admin"],
      default: "client",
    },

    client_profile: client_profile_schema,
    truck_profile: {
      driver_profile: driver_profile_schema,
      vehicle_profile: vehicle_profile_schema,
    },

    geo_location: geo_point_schema,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    settings: {
      language: {
        type: String,
        enum: ["English"],
        default: "English",
      },
      currency: {
        type: String,
        enum: ["GBP", "USD", "Euro", "PKR"],
        default: "GBP",
      },
      distance_unit: {
        type: String,
        enum: ["Miles", "Kilometers"],
        default: "Miles",
      },
      time_format: {
        type: String,
        enum: ["24 Hour", "12 Hour"],
        default: "24 Hour",
      },
      radius: {
        type: String,
        default: "25",
      },
    },
  },
  { timestamps: true, collection: "user_profiles" }
);

// 2dsphere index on geo_location
user_schema.index({ geo_location: "2dsphere" });

user_schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

user_schema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

user_schema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id.toString(), phone: this.phone, role: this.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );
};

module.exports = user_schema;
