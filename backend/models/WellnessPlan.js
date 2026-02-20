const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: String,
  carbs: String,
  fat: String,
  foods: [String]
});

const exerciseSchema = new mongoose.Schema({
  name: String,
  duration: String,
  reps: String,
  sets: String,
  calories: Number,
  instructions: [String]
});

const meditationSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  }
});

const wellnessPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goals: [{
    type: String,
    enum: ['weight_loss', 'stress_relief', 'fitness', 'better_sleep', 'mental_clarity', 'healthy_eating']
  }],
  diet: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    meals: [mealSchema],
    totalCalories: Number,
    waterIntake: Number
  }],
  workout: [{
    day: String,
    exercises: [exerciseSchema],
    focus: String,
    duration: Number
  }],
  meditation: [meditationSchema],
  sleepSchedule: {
    bedtime: String,
    wakeTime: String,
    duration: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WellnessPlan', wellnessPlanSchema);
