/**
 * 📦 Standard Success Response Utility
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} [data=undefined] - Optional data payload
 * @param {number} [statusCode=200] - HTTP status code (default: 200 OK)
 */
const sendSuccessResponse = (
  res,
  message,
  data = undefined,
  statusCode = 200
) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

module.exports = sendSuccessResponse;
