const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const client_profile_schema = require("./clientProfile.schema");
const driver_profile_schema = require("./driverProfile.schema");
const vehicle_profile_schema = require("./vehicleProfile.schema");
const setting_schema = require("./setting.schema");

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

     email: {
      type: String,
      required: [true, "Email is required"],
       unique: true,
      trim: true,
   
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

    // Optional embedded profile with no unique constraints
    client_profile: {
      type: client_profile_schema,
      default: undefined,
    },
    truck_profile: {
      driver_profile: {
        type: driver_profile_schema,
        default: undefined,
      },
      vehicle_profile: {
        type: vehicle_profile_schema,
        default: undefined,
      },
    },
    settings: {
      client_settings: { type: setting_schema, default: undefined },
      truck_settings: { type: setting_schema, default: undefined },
    },
  },
  {
    timestamps: true,
    collection: "user_profiles",
  }
);

// ✅ Hash password before save
user_schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ✅ Compare password method
user_schema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ JWT generation method
user_schema.methods.generateToken = function () {
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

module.exports = user_schema;
