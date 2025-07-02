// models/ride-Request/rideRequestSchema.js

const mongoose = require("mongoose");
const geoPointSchema = require("../user/geoPoint.schema");
const vehicleSchema   = require("./vehicleSchema");
const offerSchema     = require("./offerSchema");

const RideRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    origin_location: geoPointSchema,
    dest_location:   geoPointSchema,
    pickup_date:     { type: Date, required: true },
    vehicle_details: vehicleSchema,
    offers:          [offerSchema],
    accepted_offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
    },
    status: {
      type: String,
      enum: ["created", "posted", "accepted", "completed", "cancelled"],
      default: "created",
    },
  },
  { timestamps: true, collection: "ride_requests" }
);

// Geospatial indexes for fast $geoWithin / $near queries
RideRequestSchema.index({ origin_location: "2dsphere" });
RideRequestSchema.index({ dest_location:   "2dsphere" });

// PERFORMANCE INDEXES
// Index by user to speed up lookups of a client’s rides
RideRequestSchema.index({ user_id: 1 });
// Index on each offer’s _id for quick sub-document lookups
RideRequestSchema.index({ "offers._id": 1 });
// Index on status to quickly filter by ride lifecycle phase
RideRequestSchema.index({ status: 1 });

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
