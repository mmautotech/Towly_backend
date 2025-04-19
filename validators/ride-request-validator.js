const { z } = require("zod");

const geoPointSchema = z.object({
  type: z.literal("Point", {
    errorMap: () => ({ message: 'Location type must be "Point"' }),
  }),
  coordinates: z
    .array(z.number())
    .length(2, { message: "Coordinates must be [longitude, latitude]" }),
});

const rideRequestSchema = z.object({
  user_id: z
    .string()
    .length(24, { message: "Invalid user_id format (must be ObjectId)" }),

  origin_location: geoPointSchema,
  dest_location: geoPointSchema,

  pickup_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid pickup date",
  }),

  vehicle_details: z.object({
    Registration: z.string(),
    make: z.string(),
    Model: z.string(),
    Yearofmanufacture: z.number(),
    Wheels_category: z.enum(["rolling", "stationary"]).default("rolling"),
    vehicle_category: z
      .enum(["donot-apply", "swb", "mwb", "lwb"])
      .optional()
      .default("donot-apply"),
    loaded: z.enum(["donot-apply", "loaded"]).optional().default("donot-apply"),
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
  offer: z.record(z.any()).optional().default({}),
});

const getCreatedByUserSchema = z.object({
  user_id: z.string().nonempty("User ID is required."),
});

module.exports = {
  rideRequestSchema,
  getCreatedByUserSchema,
};
// The above code defines two Zod schemas for validating ride request data in a Node.js application. The `rideRequestSchema` validates the structure of a ride request, including user ID, origin and destination locations, vehicle details, and status. The `getCreatedByUserSchema` validates that a user ID is provided when fetching ride requests created by a specific user. These schemas help ensure that incoming data meets the expected format before processing it further in the application.
