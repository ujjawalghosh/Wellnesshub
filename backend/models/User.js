const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  // OTP fields for authentication
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  goals: [{
    type: String,
    enum: ['weight_loss', 'stress_relief', 'fitness', 'better_sleep', 'mental_clarity', 'healthy_eating']
  }],
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    type: String
  }],
  streakFreeze: {
    type: Number,
    default: 1
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    reminderTimes: [{ type: String }]
  }
}, {
  timestamps: true
});

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(otp) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }
  if (Date.now() > this.otpExpiry) {
    return false;
  }
  return this.otp === otp;
};

// Clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = null;
  this.otpExpiry = null;
};

// Add points and check for level up
userSchema.methods.addPoints = function(points) {
  this.points += points;
  const newLevel = Math.floor(this.points / 1000) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    return true; // Leveled up
  }
  return false;
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
