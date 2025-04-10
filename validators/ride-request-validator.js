const { z } = require("zod");

const rideRequestSchema = z.object({
  user_id: z.string(),
  pickupLocation: z.object({
    long: z.string(),
    lat: z.string(),
  }),
  destLocation: z.object({
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
});

module.exports = { rideRequestSchema };
