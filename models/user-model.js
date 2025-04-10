const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minlength: [3, "Username must be at least 3 characters long!"],
    maxlength: [50, "Username cannot exceed 50 characters!"],
    match: [
      /^[A-Za-z0-9_ ]+$/,
      "Username can only contain letters, numbers, underscores, and spaces",
    ],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required."],
    unique: true,
    trim: true,
    match: [
      /^\+44\d{10}$/,
      "Invalid phone format. Expected format: +44XXXXXXXXXX.",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "truck", "client"],
    default: "client",
  },
  created_at: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw new Error("Password comparison failed.");
  }
};

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

const User = mongoose.model("User", userSchema);
module.exports = User;
