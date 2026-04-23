const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/match', require('./routes/match'));
app.use('/api/github', require('./routes/github'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Hackathon Buddy API running 🚀' }));

// Initialize Editor Socket
require('./sockets/editorSocket')(io);

// --- Socket.io Real-time Chat ---
// Store messages in memory (use DB for production)
const roomMessages = {};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a project chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);

    // Send existing messages for this room
    if (roomMessages[roomId]) {
      socket.emit('room_history', roomMessages[roomId]);
    }
  });

  // Handle sending a message
  socket.on('send_message', (data) => {
    const { roomId, message, sender } = data;
    const msgObj = { sender, message, timestamp: new Date().toISOString() };

    // Store message history
    if (!roomMessages[roomId]) roomMessages[roomId] = [];
    roomMessages[roomId].push(msgObj);

    // Broadcast to all in room
    io.to(roomId).emit('receive_message', msgObj);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hackathon-buddy')
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
