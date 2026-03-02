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

console.log('=== Server Startup ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('Is Vercel:', isVercel);

// Debug: Print MONGODB_URI if loaded
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
if (!process.env.MONGODB_URI) {
  console.log('Available env vars with MON/JWT/PORT:', Object.keys(process.env).filter(k => k.includes('MON') || k.includes('JWT') || k.includes('PORT')));
}

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

// Initialize database connection
const initDB = async () => {
  if (isDBConnected) return;
  
  if (process.env.MONGODB_URI) {
    const connected = await connectDB();
    isDBConnected = connected;
    
    if (connected) {
      console.log('Database connection successful');
    } else {
      console.log('Database connection failed - please check your MongoDB URI');
    }
    
    // Monitor MongoDB connection
    mongoose.connection.on('connected', () => {
      isDBConnected = true;
      console.log('MongoDB connection established');
    });

    mongoose.connection.on('disconnected', () => {
      isDBConnected = false;
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
      isDBConnected = false;
    });
  } else {
    console.log('MongoDB URI not provided - running without database');
  }
};

// Initialize database connection
initDB();

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const mongoURIpresent = !!process.env.MONGODB_URI;
  console.log('MONGODB_URI present:', mongoURIpresent);
  
  if (!isDBConnected && process.env.MONGODB_URI) {
    console.log('Attempting to connect to MongoDB...');
    await initDB();
  } else if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI not found in environment');
  }
  
  res.json({ 
    status: 'ok', 
    message: 'WellnessHub API is running',
    database: isDBConnected ? 'connected' : 'disconnected',
    debug: {
      mongoURIpresent: mongoURIpresent,
      mongooseState: mongoose.connection.readyState,
      mongooseStates: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }
    }
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('=== Testing MongoDB Connection ===');
    console.log('MONGODB_URI in test:', !!process.env.MONGODB_URI);
    
    const result = await connectDB();
    console.log('Connection result:', result);
    console.log('Mongoose state:', mongoose.connection.readyState);
    
    res.json({
      success: result,
      state: mongoose.connection.readyState,
      message: result ? 'Connected!' : 'Failed to connect',
      mongoURIpresent: !!process.env.MONGODB_URI
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      name: error.name
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Export for Vercel serverless function
module.exports = app;

// Start server only when run directly (not when imported by Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
