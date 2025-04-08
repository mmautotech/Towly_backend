/**
 * Centralized Error Handler Middleware
 * Catches all errors and sends a consistent error response.
 */
const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "--- Internal Server Error! ---",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // Show stack in dev mode only
  });
};

module.exports = errorHandler;
