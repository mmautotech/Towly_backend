const mongoose = require("mongoose");
const geoPointSchema = require("../user/geoPointSchema");
const vehicleSchema = require("./vehicleSchema");
const offerSchema = require("./offerSchema");

const RideRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    origin_location: geoPointSchema,
    dest_location: geoPointSchema,
    pickup_date: { type: Date, required: true },
    vehicle_details: vehicleSchema,
    offers: [offerSchema],
    accepted_offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: false,
    },
    status: {
      type: String,
      enum: [
        "created",
        "posted",
        "cleared",
        "cancelled",
        "Accepted",
        "completed",
      ],
      default: "created",
    },
  },
  { timestamps: true }
);

RideRequestSchema.index({ origin_location: "2dsphere" });
RideRequestSchema.index({ dest_location: "2dsphere" });

RideRequestSchema.pre("validate", function (next) {
  if (Array.isArray(this.offers)) {
    const seen = new Set();
    this.offers = this.offers.filter((offer) => {
      const key = offer.truck_id?.toString();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return offer.offered_price != null && offer.time_to_reach?.trim();
    });
  }
  next();
});

module.exports = RideRequestSchema;
