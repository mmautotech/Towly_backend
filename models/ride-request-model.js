const mongoose = require("mongoose");
const Counter = require("./counter-model");

const RideRequestSchema = new mongoose.Schema(
  {
    request_id: {
      type: Number,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    origin_location: {
      long: String,
      lat: String,
    },
    dest_location: {
      long: String,
      lat: String,
    },
    vehicle_details: {
      Registration: String,
      make: String,
      Model: String,
      colour: String,
      Yearofmanufacture: Number,
      Wheels: String,
    },
    status: {
      type: String,
      enum: [
        "created",
        "posted",
        "accepted",
        "to_origin",
        "to_destination",
        "cleared",
        "cancelled",
      ],
      default: "created",
    },
  },
  { timestamps: true }
);

// Auto-increment logic remains the same
RideRequestSchema.pre("save", async function (next) {
  if (!this.isNew || this.request_id) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "ride_request" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    this.request_id = counter.value;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("RideRequest", RideRequestSchema);
