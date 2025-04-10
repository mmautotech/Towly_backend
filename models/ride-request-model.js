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
      Wheels_category: {
        type: String,
        enum: ["rolling", "stationary"],
        default: "rolling",
      },
      vehicle_category: {
        type: String,
        enum: ["donot-apply", "swb", "mwb", "lwb"],
        default: "donot-apply",
      },
      loaded: {
        type: String,
        enum: ["donot-apply", "loaded"],
        default: "donot-apply",
      },
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
    offers: {
      type: [
        {
          truck_id: { type: String },
          offered_price: { type: Number },
        },
      ],
      default: [],
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
