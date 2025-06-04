// server.js

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

// routers, db, middleware
const mainRouter    = require("./routes/main-router");
const connectDb     = require("./utils/db");
const errorHandler  = require("./middlewares/error-middleware");
const setupSwagger  = require("./utils/swagger");

const app = express();
setupSwagger(app);

// ─── CORS ────────────────────────────────────────────────────
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// ─── Body parsers ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static uploads ───────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── API routes ───────────────────────────────────────────────
app.use("/api", mainRouter);

// ─── Global error handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Create HTTP server + attach Socket.IO ────────────────────
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods.split(","),
    credentials: corsOptions.credentials,
  },
});

// ─── Socket.IO handshake authentication & room join ───────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Auth token missing"));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = { id: payload.id };
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const truckId = socket.user.id;
  console.log(`⚡️ Socket connected: ${socket.id} as truck ${truckId}`);
  socket.join(`truck_${truckId}`);

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ─── Make io available to controllers via req.app.get("io") ────
app.set("io", io);

// ─── Start server after DB connection ─────────────────────────
const PORT = process.env.PORT || 5000;
connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  });
