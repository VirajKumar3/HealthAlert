const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL || 'https://health-alert-one.vercel.app'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (role) => {
    if (role === 'worker') {
      socket.join('hospital_workers');
      console.log(`Socket ${socket.id} joined hospital_workers room`);
    }
  });

  socket.on('join_emergency', (emergencyId) => {
    socket.join(`emergency-${emergencyId}`);
    console.log(`Socket ${socket.id} joined emergency-${emergencyId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware to inject io into request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/patient', require('./src/routes/patientRoutes'));
app.use('/api/emergency', require('./src/routes/emergencyRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));

app.get('/', (req, res) => {
  res.send('Health Emergency Alert System API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
