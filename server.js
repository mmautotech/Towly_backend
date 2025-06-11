require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// ─── Imports ─────────────────────────────────────────────────────────────
const mainRouter = require('./routes/main-router');
const connectDb = require('./utils/db');
const errorHandler = require('./middlewares/error-middleware');
const setupSwagger = require('./utils/swagger');

// ─── Init App ────────────────────────────────────────────────────────────
const app = express();
setupSwagger(app);

// ─── CORS ────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,PATCH,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

// ─── Parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ──────────────────────────────────────────────────────────
app.use('/api', mainRouter);

// ─── Global Error Middleware ─────────────────────────────────────────────
app.use(errorHandler);

// ─── HTTP Server & Socket.IO ─────────────────────────────────────────────
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods.split(','),
    credentials: corsOptions.credentials,
  },
});

// ─── Socket.IO Authentication ────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Auth token missing'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = { id: decoded.id };
    next();
  } catch (err) {
    return next(new Error('Invalid or expired token'));
  }
});

// ─── Socket.IO Event Handling ────────────────────────────────────────────
io.on('connection', (socket) => {
  const truckId = socket.user.id;
  console.log(`⚡ Truck ${truckId} connected via socket ${socket.id}`);
  socket.join(`truck_${truckId}`);
  console.log('🛏 Joined rooms:', [...socket.rooms]);
  
  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ─── Make Socket Instance Available ──────────────────────────────────────
app.set('io', io);

// ─── Start Server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Server running: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  });
