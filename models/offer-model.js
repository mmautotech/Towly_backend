const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema(
  {
    request_id: {
      type: Number,
      required: true,
      index: true,
    },
    truck_id: {
      type: String,
      required: true,
    },
    price_offered: {
      type: String, // or Number, if no currency symbol needed
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", OfferSchema);
