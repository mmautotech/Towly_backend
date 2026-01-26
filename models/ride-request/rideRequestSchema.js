const mongoose = require("mongoose");
const geoPointSchema = require("../user/geoPoint.schema");
const vehicleSchema = require("./vehicleSchema");
const offerSchema = require("./offerSchema");

// Extend geoPointSchema to include address
const geoPointWithAddressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
  address: { type: String }, // <-- added address field
});

const RideRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    origin_location: geoPointWithAddressSchema, // updated
    dest_location: geoPointWithAddressSchema,   // updated
    pickup_date: { type: Date, required: true },
    vehicle_details: vehicleSchema,
    offers: [offerSchema],
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
RideRequestSchema.index({ dest_location: "2dsphere" });

// PERFORMANCE INDEXES
RideRequestSchema.index({ user_id: 1 });
RideRequestSchema.index({ "offers._id": 1 });
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
