require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const habitRoutes = require('./routes/habits');
const challengeRoutes = require('./routes/challenges');
const breakRoutes = require('./routes/breaks');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Track MongoDB connection status
let isDBConnected = false;

// Connect to MongoDB
connectDB();

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  isDBConnected = true;
  console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  isDBConnected = false;
  console.log('MongoDB connection lost');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

// Middleware - Allow all origins for development
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WellnessHub API is running',
    database: isDBConnected ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
