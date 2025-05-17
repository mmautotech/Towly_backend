const mongoose = require("mongoose");
const imageSchema = require("./image.schema");

const nestedImage = {
  original: { type: imageSchema },
  compressed: { type: imageSchema },
};

const driverProfileSchema = new mongoose.Schema(
  {
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    date_of_birth: { type: Date },
    license_number: { type: String, default: "" },
    license_expiry: { type: Date },
    license_front: nestedImage,
    license_back: nestedImage,
    license_selfie: nestedImage,
  },
  { _id: false }
);

module.exports = driverProfileSchema;
