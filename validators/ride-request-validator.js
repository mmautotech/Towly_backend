// validators/ride-request-validator.js
const { z } = require("zod");

// reuse the geo/schema from your models if you like, or redefine:
const geo_point_schema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).length(2, "Must be [lng, lat]"),
});

const ride_request_schema = z.object({
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
    wheels_category: z
      .enum(["Wheels Are Rolling", "Wheels Are Not Rolling"])
      .default("Wheels Are Rolling"),
    vehicle_category: z
      .enum([
        "donot-apply",
        "Short Wheel Base",
        "Medium Wheel Base",
        "Long Wheel Base",
      ])
      .default("donot-apply"),
    loaded: z.enum(["Unloaded", "Loaded"]).default("Unloaded"),
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
  request_id: z.string().length(24, "Invalid request_id"),
});

const accept_ride_schema = z.object({
  request_id: z.string().length(24, "Invalid request_id"),
  offer_id: z.string().length(24, "Invalid offer_id"),
});

const reopen_ride_schema = z.object({
  request_id: z.string().length(24, "Invalid request_id"),
  reason: z.string().min(3, "Reason required").max(500).optional(), // if you want to require a reason, remove .optional()
});

const cancel_ride_schema = z.object({
  request_id: z.string().length(24, "Invalid request_id"),
  reason: z.string().min(3, "Reason required").max(500).optional(),
});

const complete_ride_schema = z.object({
  request_id: z.string().length(24, "Invalid request_id"),
});

const get_offers_schema = z.object({
  request_id: z.string().length(24),
});

// validators/ride-request-validator.js
const add_offer_schema = z.object({
  request_id: z.string().length(24, "Invalid request_id"),
  offered_price: z.number().positive("Must be a positive number"),
  days: z.number().int().min(0).default(0),
  hours: z.number().int().min(0).max(23).default(0),
  minutes: z.number().int().min(0).max(59).default(0),
});

const add_counter_offer_schema = z.object({
  offer_id: z.string().length(24, "Invalid offer_id"),
  client_counter_price: z.number().positive("Must be a positive number"),
});

module.exports = {
  ride_request_schema,
  get_created_by_user_schema,

  post_ride_schema,
  accept_ride_schema,
  reopen_ride_schema,
  cancel_ride_schema,
  complete_ride_schema,

  get_offers_schema,
  add_offer_schema,
  add_counter_offer_schema,
};
// ===================== 📝 Ride Request Validation Schema ===================== //
