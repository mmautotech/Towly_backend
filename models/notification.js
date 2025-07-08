const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "rideAccepted",
        "rideReopened",
        "rideCancelled",
        "rideCompleted",
        // Add more notification types as needed
      ],
      required: true,
      index: true,
    },
    ride_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideRequest",
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Notification", NotificationSchema);
