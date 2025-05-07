// Load environment variables as early as possible
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// Import custom modules
const mainRouter = require("./routes/main-router");
const connectDb = require("./utils/db");
const errorHandler = require("./middlewares/error-middleware");

const app = express();

// Swagger UI setup
const setupSwaggerDocs = require("./utils/swagger");
setupSwaggerDocs(app);

// CORS: allow PATCH in addition to GET/POST/PUT/DELETE
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
// for parsing application/x-www-form-urlencoded (needed if you use multer + form fields)
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount your main router for API routes
app.use("/api/", mainRouter);

// Global error-handling middleware (should be the last middleware)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
