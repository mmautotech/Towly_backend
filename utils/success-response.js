/**
 * 📦 Standard Success Response Utility
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} [data={}] - Optional data payload
 * @param {number} [statusCode=200] - HTTP status code (default: 200 OK)
 */
const sendSuccessResponse = (res, message, data = {}, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(), // Add a timestamp for consistency
    });
  };
  
  module.exports = sendSuccessResponse;
  