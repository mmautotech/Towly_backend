const { z } = require("zod");

const rideRequestSchema = z.object({
  user_id: z.string(),
  origin_location: z.object({
    long: z.string(),
    lat: z.string(),
  }),
  dest_location: z.object({
    long: z.string(),
    lat: z.string(),
  }),
  vehicle_details: z.object({
    Registration: z.string(),
    make: z.string(),
    Model: z.string(),
    colour: z.string(),
    Yearofmanufacture: z.number(),
    Wheels: z.string(),
  }),
  status: z
    .enum([
      "created",
      "posted",
      "accepted",
      "to_origin",
      "to_destination",
      "cleared",
      "cancelled",
    ])
    .optional()
    .default("created"),
});

const getCreatedByUserSchema = z.object({
  user_id: z.string().nonempty("User ID is required."),
});

module.exports = {
  rideRequestSchema,
  getCreatedByUserSchema,
};
// The above code defines two Zod schemas for validating ride request data in a Node.js application. The `rideRequestSchema` validates the structure of a ride request, including user ID, origin and destination locations, vehicle details, and status. The `getCreatedByUserSchema` validates that a user ID is provided when fetching ride requests created by a specific user. These schemas help ensure that incoming data meets the expected format before processing it further in the application.
