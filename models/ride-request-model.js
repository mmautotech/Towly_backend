const mongoose = require("mongoose");

const RideRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    origin_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    dest_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
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

    offers: [
      {
        truck_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        offered_price: {
          type: Number,
          required: true,
          min: 0,
        },
        time_to_reach: {
          type: String,
          trim: true,
          maxlength: 50,
          validate: {
            validator: (v) => v && v.length > 0,
            message: "time_to_reach is required",
          },
        },
      },
    ],

    status: {
      type: String,
      enum: ["created", "posted", "cleared", "cancelled"],
      default: "created",
    },
  },
  { timestamps: true }
);

// ✅ 2dsphere Indexes
RideRequestSchema.index(
  { origin_location: "2dsphere" },
  { name: "2dsphere_origin" }
);
RideRequestSchema.index(
  { dest_location: "2dsphere" },
  { name: "2dsphere_dest" }
);

// ✅ Validate and Deduplicate Offers
RideRequestSchema.pre("validate", function (next) {
  if (Array.isArray(this.offers)) {
    // Remove invalid offers
    this.offers = this.offers.filter(
      (offer) =>
        offer.truck_id &&
        offer.offered_price !== undefined &&
        offer.offered_price !== null &&
        offer.time_to_reach?.trim() !== ""
    );

    // Ensure only one offer per truck_id
    const seen = new Map();
    this.offers = this.offers.filter((offer) => {
      const key = offer.truck_id.toString();
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });
  }
  next();
});

module.exports = mongoose.model("RideRequest", RideRequestSchema);
