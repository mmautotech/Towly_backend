const { ZodError } = require("zod");

const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return res
        .status(400)
        .json({ message: "Validation error", errors: formattedErrors });
    }
    if (res.headersSent) return; // Don't respond again if headers are already sent
    // Handle other types of errors (e.g., server errors)
    res
      .status(500)
      .json({ status: "error", message: "Server error", error: error.message });
  }
};

module.exports = validateRequest;
