// Load environment variables as early as possible
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import custom modules
const mainRouter = require("./routes/main-router");
const connectDb = require("./utils/db");
const errorHandler = require("./middlewares/error-middleware");

const app = express();

const setupSwaggerDocs = require("./utils/swagger");
setupSwaggerDocs(app);

// Define PORT with fallback to 5000
const PORT = process.env.PORT || 5000;

// Enable CORS with specified options
const corsOptions = {
  origin: "http://localhost:5173", // Adjust as needed for your front-end
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Mount your main router for API routes
app.use("/api/", mainRouter);

// Global error-handling middleware (should be the last middleware)
app.use(errorHandler);

// Start the server after successfully connecting to the database
const startServer = async () => {
  try {
    await connectDb(); // Connect to MongoDB Atlas using your MONGO_URI from .env
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}/api/`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1); // Terminate the process on DB connection failure
  }
};

startServer();
