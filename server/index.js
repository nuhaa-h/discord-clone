require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const { verifyToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', verifyToken, channelRoutes);
app.use('/api/messages', verifyToken, messageRoutes);

app.get('/', (req, res) => res.json({ message: 'Discord Clone API running' }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/discord-clone')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Socket.io - real-time messaging
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

  // Join a channel room
  socket.on('join_channel', (channelId) => {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) socket.leave(room);
    });
    socket.join(channelId);
    console.log(`👤 ${socket.user.username} joined channel: ${channelId}`);
  });

  // New message
  socket.on('send_message', async (data) => {
    try {
      const { channelId, content } = data;
      if (!content || !content.trim()) return;

      const message = new Message({
        channel: channelId,
        author: socket.user.id,
        authorName: socket.user.username,
        content: content.trim(),
      });
      await message.save();

      const populated = await Message.findById(message._id).populate('author', 'username');

      io.to(channelId).emit('new_message', {
        _id: populated._id,
        content: populated.content,
        authorName: populated.authorName,
        author: { _id: populated.author._id, username: populated.author.username },
        channel: channelId,
        createdAt: populated.createdAt,
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.channelId).emit('user_typing', {
      username: socket.user.username,
      isTyping: data.isTyping,
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.user.username}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
