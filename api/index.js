// WellnessHub API - Vercel Serverless Entry Point

// Load environment variables
require('dotenv').config({ path: __dirname + '/../.env.production' });

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
      return true;
    }
    console.log('MONGODB_URI not provided');
    return false;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return false;
  }
};

// Initialize DB connection
let dbConnected = false;
const initDB = async () => {
  if (!dbConnected) {
    dbConnected = await connectDB();
  }
  return dbConnected;
};

// Import routes from backend
const authRoutes = require('../backend/routes/auth');
const planRoutes = require('../backend/routes/plans');
const habitRoutes = require('../backend/routes/habits');
const challengeRoutes = require('../backend/routes/challenges');
const breakRoutes = require('../backend/routes/breaks');
const analyticsRoutes = require('../backend/routes/analytics');
const waterRoutes = require('../backend/routes/water');
const sleepRoutes = require('../backend/routes/sleep');
const moodRoutes = require('../backend/routes/mood');
const bodyRoutes = require('../backend/routes/body');
const nutritionRoutes = require('../backend/routes/nutrition');
const pomodoroRoutes = require('../backend/routes/pomodoro');
const meditationRoutes = require('../backend/routes/meditation');
const friendsRoutes = require('../backend/routes/friends');
const affirmationsRoutes = require('../backend/routes/affirmations');

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  await initDB();
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/body', bodyRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/meditation', meditationRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/affirmations', affirmationsRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WellnessHub API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Export for Vercel
module.exports = app;

