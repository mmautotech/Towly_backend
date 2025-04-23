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
  user_id: z.string().length(24, { message: "Invalid user_id" }),
});

const postRideSchema = z.object({
  user_id: z.string().length(24, { message: "Invalid user_id format" }),
  request_id: z.string().length(24, { message: "Invalid request_id format" }),
});

const addOfferSchema = z.object({
  request_id: z.string().length(24, { message: "Invalid request_id format" }),
  truck_id: z.string().length(24, { message: "Invalid truck_id format" }),
  offered_price: z.number().positive("Offered price must be positive"),
  days: z.number().int().min(0).optional().default(0),
  hours: z.number().int().min(0).max(23).optional().default(0),
  minutes: z.number().int().min(0).max(59).optional().default(0),
});

const getOffersSchema = z.object({
  user_id: z.string().min(1, "user_id is required"),
  request_id: z.string().min(1, "request_id is required"),
});

module.exports = {
  rideRequestSchema,
  getCreatedByUserSchema,
  postRideSchema,
  addOfferSchema,
  geoPointSchema,
  getOffersSchema,
};
