// validators/ride-request-validator.js
const { z } = require("zod");

// reuse the geo/schema from your models if you like, or redefine:
const geo_point_schema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).length(2, "Must be [lng, lat]"),
});

const ride_request_schema = z.object({
  user_id: z.string().length(24, "Invalid user_id"),
  origin_location: geo_point_schema,
  dest_location: geo_point_schema,
  pickup_date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid pickup_date"),
  vehicle_details: z.object({
    registration: z.string(),
    make: z.string(),
    model: z.string(),
    year_of_manufacture: z.number(),
    wheels_category: z.enum(["rolling", "stationary"]).default("rolling"),
    vehicle_category: z
      .enum(["donot-apply", "swb", "mwb", "lwb"])
      .default("donot-apply"),
    loaded: z.enum(["donot-apply", "loaded"]).default("donot-apply"),
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
    .default("created"),
  // offers & other sub-schemas can remain as needed
});

const get_created_by_user_schema = z.object({
  user_id: z.string().length(24, "Invalid user_id"),
});

const post_ride_schema = z.object({
  user_id: z.string().length(24, "Invalid user_id"),
  request_id: z.string().length(24, "Invalid request_id"),
});

const accept_ride_schema = post_ride_schema.extend({
  offer_id: z.string().length(24, "Invalid offer_id"),
});

const cancel_ride_schema = post_ride_schema;

const get_offers_schema = z.object({
  request_id: z.string().length(24),
});

const get_single_truck_offer_schema = z.object({
  request_id: z.string().length(24),
  truck_id: z.string().length(24),
});

const add_offer_schema = z.object({
  request_id: z.string().length(24),
  truck_id: z.string().length(24),
  offered_price: z.number().positive(),
  days: z.number().int().min(0).default(0),
  hours: z.number().int().min(0).max(23).default(0),
  minutes: z.number().int().min(0).max(59).default(0),
});

const add_counter_offer_schema = z.object({
  request_id: z.string().length(24),
  offer_id: z.string().length(24),
  client_counter_price: z.number().positive(),
});

module.exports = {
  ride_request_schema,
  get_created_by_user_schema,
  post_ride_schema,
  accept_ride_schema,
  cancel_ride_schema,
  get_offers_schema,
  get_single_truck_offer_schema,
  add_offer_schema,
  add_counter_offer_schema,
};
// ===================== 📝 Ride Request Validation Schema ===================== //
