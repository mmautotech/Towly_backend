// validators/truck-profile-validator.js
const { z } = require("zod");

const update_driver_profile_schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  license_number: z.string().min(1, "License number is required"),

  date_of_birth: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, {
    message: "Date of birth must be in DD-MM-YYYY format",
  }),
  license_expiry: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, {
    message: "License expiry must be in DD-MM-YYYY format",
  }),
  // driver_photo's handled via multipart
});

const update_vehicle_profile_schema = z.object({
  registration_number: z.string().min(1, "Registration number is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color is required"),
  // vehicle_photo handled via multipart
});

module.exports = {
  update_driver_profile_schema,
  update_vehicle_profile_schema,
};
