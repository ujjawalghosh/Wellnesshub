const mongoose = require('mongoose');

const WellnessPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  goals: [{
    type: String
  }],
  meditation: {
    type: [mongoose.Schema.Types.Mixed], // Accept arrays, objects, strings
    default: []
  },
  diet: {
    type: [mongoose.Schema.Types.Mixed], // Store any diet data structure
    default: []
  },
  sleepSchedule: {
    type: mongoose.Schema.Types.Mixed, // Store any sleep schedule structure
    default: {}
  },
  workout: [{
    day: String,
    focus: String,
    exercises: [{
      name: String,
      sets: mongoose.Schema.Types.Mixed, // Accept both Number and String
      reps: mongoose.Schema.Types.Mixed, // Accept both Number and String
      duration: mongoose.Schema.Types.Mixed, // Accept both Number and String
      instructions: [String],
      calories: Number
    }],
    duration: mongoose.Schema.Types.Mixed // Accept both Number and String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WellnessPlan', WellnessPlanSchema);
