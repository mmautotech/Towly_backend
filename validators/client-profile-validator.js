// validators/client-profile-validator.js
const { z } = require("zod");

const update_client_profile_schema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
  // profile_photo handled via multipart upload
});

module.exports = { update_client_profile_schema };
