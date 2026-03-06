// WellnessHub API - Vercel Serverless Handler
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

console.log('=== API Starting ===');
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);

// Create express app
const app = express();

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
let isDBConnected = false;

const connectDB = async () => {
  if (isDBConnected || mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    isDBConnected = true;
    return true;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI not found in environment variables');
      return false;
    }

    mongoose.set('bufferCommands', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isDBConnected = true;
    console.log('MongoDB Connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    isDBConnected = false;
    return false;
  }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  if (!isDBConnected) {
    await connectDB();
  }
  next();
});

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

// Mount routes
app.use('/auth', authRoutes);
app.use('/plans', planRoutes);
app.use('/habits', habitRoutes);
app.use('/challenges', challengeRoutes);
app.use('/breaks', breakRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/water', waterRoutes);
app.use('/sleep', sleepRoutes);
app.use('/mood', moodRoutes);
app.use('/body', bodyRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/pomodoro', pomodoroRoutes);
app.use('/meditation', meditationRoutes);
app.use('/friends', friendsRoutes);
app.use('/affirmations', affirmationsRoutes);

// Health check
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', message: 'WellnessHub API is running', database: dbStatus });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

module.exports = app;
