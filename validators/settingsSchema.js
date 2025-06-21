// validators/settingsSchema.js
const { z } = require("zod");

const settingsSchema = z.object({
  language: z.string().trim().min(1).optional(),
  currency: z.string().trim().min(1).optional(),
  distance_unit: z.enum(["Miles", "Kilometers"]).optional(),
  time_format: z.enum(["12 Hour", "24 Hour"]).optional(),
  radius: z.union([
    z.string().regex(/^\d+$/, "Must be a number as string"),
    z.number()
  ]).optional(),
});

module.exports = settingsSchema;
