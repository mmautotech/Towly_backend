// validator-middleware.js
const { ZodError } = require("zod");

const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formatted = error.errors.map((e) => ({
        field: e.path[0],
        message: e.message,
      }));
      return res
        .status(400)
        .json({ message: "Validation error", errors: formatted });
    }
    if (!res.headersSent) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
};

module.exports = validateRequest;
