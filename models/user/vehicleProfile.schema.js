const mongoose = require("mongoose");
const imageSchema = require("./image.schema");
const geoPointSchema = require("./geoPoint.schema");

const nestedImage = {
  original: { type: imageSchema },
  compressed: { type: imageSchema },
};

const vehicleProfileSchema = new mongoose.Schema(
  {
    registration_number: { type: String, default: "" },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    color: { type: String, default: "" },
    vehicle_photo: nestedImage,
    geo_location: {
      type: geoPointSchema,
      default: { type: "Point", coordinates: [0, 0] },
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratings_count: { type: Number, default: 0 },
  },
  { _id: false }
);

module.exports = vehicleProfileSchema;
