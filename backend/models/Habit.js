const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    default: 'general'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  targetDays: [{
    type: Number
  }],
  reminder: {
    type: String
  },
  color: {
    type: String,
    default: '#10B981'
  },
  icon: {
    type: String,
    default: 'check'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completions: [{
    date: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCompletions: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update streak method
HabitSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.completions || this.completions.length === 0) {
    this.streak = 0;
    this.totalCompletions = this.completions ? this.completions.length : 0;
    return;
  }
  
  // Sort completions by date (newest first)
  const sortedCompletions = [...this.completions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  const lastCompletion = new Date(sortedCompletions[0].date);
  lastCompletion.setHours(0, 0, 0, 0);
  
  // Calculate days since last completion
  const daysDiff = Math.floor((today - lastCompletion) / (1000 * 60 * 60 * 24));
  
  // If there's only one completion (first time), set streak to 1
  if (sortedCompletions.length === 1) {
    this.streak = 1;
  } else if (daysDiff === 0) {
    // Already completed today, streak stays the same (don't increment again)
    // Do nothing
  } else if (daysDiff === 1) {
    // Completed yesterday (or consecutively), increment streak
    this.streak += 1;
  } else {
    // Missed days, reset streak to 1 for new streak
    this.streak = 1;
  }
  
  // Update longest streak
  if (this.streak > this.longestStreak) {
    this.longestStreak = this.streak;
  }
  
  // Update total completions
  this.totalCompletions = this.completions.length;
};

// Pre-save hook to update streak before saving
HabitSchema.pre('save', function(next) {
  // Update streak based on current completions
  this.updateStreak();
  next();
});

module.exports = mongoose.model('Habit', HabitSchema);
