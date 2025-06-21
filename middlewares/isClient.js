module.exports = function (req, res, next) {
  if (req.user && req.user.role === 'client') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Clients only."
  });
};
