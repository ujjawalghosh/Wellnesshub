// Load dotenv FIRST at the very top, before any other imports
require('dotenv').config();

const path = require('path');
const fs = require('fs');

// Check if we're running on Vercel
const isVercel = process.env.VERCEL === '1';

// For local development only - set defaults if not from .env file
if (!isVercel && !process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/wellnesshub';
  console.log('Using default MongoDB URI for local development');
}
if (!isVercel && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'wellnesshub_jwt_secret_key_2024';
  console.log('Using default JWT_SECRET for local development');
}

console.log('=== Vercel API Startup ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('Is Vercel:', isVercel);

// Debug: Print MONGODB_URI if loaded
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Create Express app
const app = express();

// Import routes directly to avoid issues
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

// Track MongoDB connection status
let isDBConnected = false;

// Database connection function
const connectDB = require('../backend/config/db');

// Initialize database connection
const initDB = async () => {
  if (isDBConnected) return;
  
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      isDBConnected = true;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      isDBConnected = false;
    }
  } else {
    console.log('MongoDB URI not provided - running without database');
  }
};

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB on startup
initDB().then(() => {
  console.log('Database initialization complete');
});

// API Routes - mounted under /api prefix
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
app.get('/health', async (req, res) => {
  const mongoURIpresent = !!process.env.MONGODB_URI;
  
  if (!isDBConnected && process.env.MONGODB_URI) {
    await initDB();
  }
  
  res.json({ 
    status: 'ok', 
    message: 'WellnessHub API is running',
    database: isDBConnected ? 'connected' : 'disconnected'
  });
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    const result = await initDB();
    res.json({
      success: isDBConnected,
      state: mongoose.connection.readyState,
      message: isDBConnected ? 'Connected!' : 'Failed to connect'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Export for Vercel
module.exports = app;

