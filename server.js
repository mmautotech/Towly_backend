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
const allowedOrigins = ['http://localhost:5173', 'https://towly.info'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests like Postman
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// ─── Socket.IO Authentication ────────────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Auth token missing'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return next(new Error('Invalid or expired token'));
  }
});

// ─── Socket.IO Event Handling ────────────────────────────────────────────
io.on('connection', (socket) => {
  const { id, role } = socket.user;

  if (role === 'client') {
    socket.join(`client_${id}`);
    console.log(`📡 Client joined: client_${id}`);
  } else if (role === 'truck') {
    socket.join(`truck_${id}`);
    console.log(`📡 Truck joined: truck_${id}`);
  }

  console.log(`✅ Socket connected: ${socket.id}`);
  console.log('🛏 Joined rooms:', [...socket.rooms]);

  socket.on('join-chat', ({ user1, user2 }) => {
    if (!user1 || !user2) return;
    const chatRoom = `chat_${[user1, user2].sort().join('_')}`;
    socket.join(chatRoom);
    console.log(`📥 ${socket.user.id} joined chat room: ${chatRoom}`);
  });

  socket.on('join', room => {
    socket.join(room);
    console.log(`✅ Socket joined room: ${room}`);
  });

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
