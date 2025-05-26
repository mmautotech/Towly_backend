// server.js

// Load environment variables as early as possible
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const socketIo = require("socket.io");

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
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount your main router for API routes
app.use("/api/", mainRouter);

// Global error-handling middleware (should be the last middleware)
app.use(errorHandler);

// Create HTTP server and attach Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: corsOptions.credentials,
  },
});

// Make io available in your routes/controllers via req.app.get('io')
app.set("io", io);

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`⚡️ Socket connected: ${socket.id}`);

  // Listen for trucks registering themselves
  socket.on("registerTruck", (truckId) => {
    console.log(`🚚 Truck ${truckId} joined room`);
    socket.join(`truck_${truckId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDb();
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
