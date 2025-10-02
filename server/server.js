const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Fallback environment variables if .env is not loaded
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://ommanglani88dbuser:7058223923OM@sellnextcluster.0s4k5f3.mongodb.net/?retryWrites=true&w=majority&appName=SellNextcluster';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}
if (!process.env.PORT) {
  process.env.PORT = '5000';
}
if (!process.env.CLIENT_URL) {
  process.env.CLIENT_URL = 'http://localhost:5173';
}

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/messages', require('./routes/messages'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SellNext API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.user.fullName} connected`);
  
  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  
  // Handle joining conversation rooms
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });
  
  // Handle leaving conversation rooms
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });
  
  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, receiverId, content, messageType = 'text' } = data;
      
      // Broadcast message to conversation room
      socket.to(`conversation_${conversationId}`).emit('new_message', {
        conversationId,
        senderId: socket.userId,
        senderName: socket.user.fullName,
        content,
        messageType,
        timestamp: new Date()
      });
      
      // Send notification to receiver
      socket.to(`user_${receiverId}`).emit('message_notification', {
        conversationId,
        senderId: socket.userId,
        senderName: socket.user.fullName,
        content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.fullName
    });
  });
  
  socket.on('typing_stop', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stopped_typing', {
      userId: socket.userId
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.fullName} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Socket.io enabled for real-time messaging`);
});