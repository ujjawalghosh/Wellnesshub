const mongoose = require('mongoose');

const PomodoroSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Session type
  type: {
    type: String,
    enum: ['work', 'study', 'creative', 'exercise', 'other'],
    default: 'work'
  },
  // Timer settings used
  settings: {
    workDuration: {
      type: Number,
      default: 25 // minutes
    },
    shortBreakDuration: {
      type: Number,
      default: 5
    },
    longBreakDuration: {
      type: Number,
      default: 15
    },
    sessionsBeforeLongBreak: {
      type: Number,
      default: 4
    }
  },
  // Session details
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // actual duration in minutes
  },
  // Status
  status: {
    type: String,
    enum: ['running', 'paused', 'completed', 'cancelled'],
    default: 'completed'
  },
  // What was worked on
  task: {
    name: String,
    notes: String,
    category: String
  },
  // Productivity rating
  productivityRating: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  // Energy level before and after
  energyBefore: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  energyAfter: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  // Distractions count
  distractions: {
    type: Number,
    default: 0
  },
  // Break taken after
  breakTaken: {
    type: Boolean,
    default: false
  },
  breakDuration: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
PomodoroSessionSchema.index({ userId: 1, date: -1 });

// Virtual for session length category
PomodoroSessionSchema.virtual('isLongSession').get(function() {
  return this.duration >= this.settings.workDuration * 1.5;
});

// Virtual for effective work time
PomodoroSessionSchema.virtual('effectiveTime').get(function() {
  if (!this.duration) return 0;
  const distractionsMinutes = this.distractions * 5; // Assume 5 min per distraction
  return Math.max(0, this.duration - distractionsMinutes);
});

// Pre-save middleware to calculate duration
PomodoroSessionSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const diff = this.endTime - this.startTime;
    this.duration = Math.round(diff / 60000); // Convert to minutes
  }
  next();
});

// Static method to get daily stats
PomodoroSessionSchema.statics.getDailyStats = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const sessions = await this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: 'completed'
  });
  
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const completedSessions = sessions.length;
  const avgProductivity = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.productivityRating || 3), 0) / sessions.length
    : 0;
  
  // Group by type
  const byType = {};
  sessions.forEach(s => {
    if (!byType[s.type]) byType[s.type] = { sessions: 0, minutes: 0 };
    byType[s.type].sessions += 1;
    byType[s.type].minutes += s.duration || 0;
  });
  
  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    completedSessions,
    avgProductivity: Math.round(avgProductivity * 10) / 10,
    byType,
    sessions
  };
};

// Static method to get weekly stats
PomodoroSessionSchema.statics.getWeeklyStats = async function(userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const sessions = await this.find({
    userId,
    date: { $gte: startDate, $lt: endDate },
    status: 'completed'
  }).sort({ date: -1 });
  
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const completedSessions = sessions.length;
  
  // Daily breakdown
  const dailyData = {};
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    const dayStr = day.toISOString().split('T')[0];
    dailyData[dayStr] = { sessions: 0, minutes: 0 };
  }
  
  sessions.forEach(s => {
    const dayStr = s.date.toISOString().split('T')[0];
    if (dailyData[dayStr]) {
      dailyData[dayStr].sessions += 1;
      dailyData[dayStr].minutes += s.duration || 0;
    }
  });
  
  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    completedSessions,
    avgPerDay: Math.round((totalMinutes / 7) * 10) / 10,
    dailyData,
    sessions
  };
};

// Static method to get streak (consecutive days with completed sessions)
PomodoroSessionSchema.statics.getStreak = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  while (true) {
    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const session = await this.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    });
    
    if (session) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

module.exports = mongoose.model('PomodoroSession', PomodoroSessionSchema);

