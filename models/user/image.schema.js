// models/user/image.schema.js
const mongoose = require("mongoose");

const image_schema = new mongoose.Schema(
  {
    data: Buffer,
    content_type: String,
  },
  { _id: false }
);

module.exports = image_schema;
