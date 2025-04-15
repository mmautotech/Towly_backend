const mongoose = require("mongoose");
const Counter = require("./counter-model");

const RideRequestSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    origin_location: {
      lat: String,
      long: String,
    },
    dest_location: {
      lat: String,
      long: String,
    },
    pickup_date: { type: Date, required: true },
    vehicle_details: {
      Registration: String,
      make: String,
      Model: String,
      Yearofmanufacture: Number,
      Wheels_category: {
        type: String,
        default: "rolling",
      },
      vehicle_category: {
        type: String,
        default: "donot-apply",
      },
      loaded: {
        type: String,
        default: "donot-apply",
      },
    },
    offers: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      default: "created",
    },
    request_id: {
      type: Number,
      unique: true,
    },
  },
  { timestamps: true }
);

// Clean invalid offers before validation
RideRequestSchema.pre("validate", function (next) {
  if (Array.isArray(this.offers)) {
    this.offers = this.offers.filter(
      (offer) =>
        offer.truck_id &&
        offer.offered_price !== undefined &&
        offer.offered_price !== null
    );
  }
  next();
});

// Auto-increment logic
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
