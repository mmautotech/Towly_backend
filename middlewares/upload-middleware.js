// middlewares/upload-middleware.js
const multer = require("multer");

// Use Multer’s memory storage so uploaded files are available as Buffer in req.file.buffer
const storage = multer.memoryStorage();

// Optional: only accept image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB per file
  },
});
