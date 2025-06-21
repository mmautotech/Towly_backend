// middlewares/isTruck.js
module.exports = function (req, res, next) {
  if (req.user && req.user.role === 'truck') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Truck users only."
  });
};
