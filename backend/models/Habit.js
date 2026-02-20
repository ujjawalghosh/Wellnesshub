const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'mindfulness', 'nutrition', 'sleep', 'custom'],
    default: 'custom'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  targetDays: {
    type: [Number], // 0-6 for Sunday-Saturday
    default: [0, 1, 2, 3, 4, 5, 6]
  },
  reminder: {
    enabled: { type: Boolean, default: false },
    time: String
  },
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
  completions: [{
    date: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: true
    },
    notes: String
  }],
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
  }
}, {
  timestamps: true
});

// Update streak method
habitSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCompletion = this.completions[this.completions.length - 1];
  
  if (lastCompletion) {
    const lastDate = new Date(lastCompletion.date);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.streak += 1;
    } else if (diffDays > 1) {
      this.streak = 1;
    }
    
    if (this.streak > this.longestStreak) {
      this.longestStreak = this.streak;
    }
  }
  
  this.totalCompletions += 1;
};

module.exports = mongoose.model('Habit', habitSchema);
