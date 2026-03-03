const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  // Gamification fields
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date
  },
  // Wellness profile
  wellnessProfile: {
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    goals: [String],
    preferences: {
      workoutDuration: Number,
      meditationMinutes: Number,
      sleepTarget: Number
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
UserSchema.methods.generateOTP = function() {
  this.otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return this.otp;
};

// Verify OTP
UserSchema.methods.verifyOTP = function(otp) {
  return (
    this.otp === otp &&
    this.otpExpiry &&
    Date.now() < this.otpExpiry.getTime()
  );
};

// Clear OTP
UserSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpiry = undefined;
};

module.exports = mongoose.model('User', UserSchema);
