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
    pickupLocation: {
      long: String,
      lat: String,
    },
    destLocation: {
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
  },
  { timestamps: true }
);

RideRequestSchema.pre("save", async function (next) {
  if (!this.isNew || this.request_id) return next(); // Avoid overwriting if already set

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "ride_request" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    this.request_id = counter.value;
    next();
  } catch (err) {
    next(err); // Pass error to express error handler
  }
});

module.exports = mongoose.model("RideRequest", RideRequestSchema);
