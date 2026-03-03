const mongoose = require('mongoose');

const MeditationSessionSchema = new mongoose.Schema({
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
    enum: ['mindfulness', 'guided', 'breathing', 'body-scan', 'loving-kindness', 'transcendental', 'zen', 'sound', 'movement', 'other'],
    default: 'mindfulness'
  },
  // Duration
  duration: {
    type: Number, // in minutes
    required: true
  },
  plannedDuration: {
    type: Number // what was planned
  },
  // Timing
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  // Time of day
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
  },
  // Setting
  setting: {
    type: String,
    enum: ['home', 'office', 'outdoor', 'studio', 'travel', 'other'],
    default: 'home'
  },
  // Posture
  posture: {
    type: String,
    enum: ['sitting', 'lying', 'walking', 'standing', 'moving'],
    default: 'sitting'
  },
  // Quality/Experience
  quality: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  // Focus rating
  focusRating: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  // Calm rating
  calmRating: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  // Distractions
  distractions: {
    count: {
      type: Number,
      default: 0
    },
    types: [String]
  },
  // Feelings during
  feelings: [{
    type: String,
    enum: ['peaceful', 'anxious', 'restless', 'alert', 'drowsy', 'centered', 'scattered', 'grateful', 'stressed', 'relaxed']
  }],
  // Insights
  insights: {
    type: String,
    maxlength: 1000
  },
  // Goals for session
  intention: {
    type: String,
    maxlength: 200
  },
  // Benefits felt after
  benefits: [{
    type: String,
    enum: ['stress-relief', 'better-focus', 'emotional-balance', 'sleep-improvement', 'reduced-anxiety', 'more-creativity', 'better-relationships', 'self-awareness', 'inner-peace', 'other']
  }],
  // Session completed fully
  completedFully: {
    type: Boolean,
    default: true
  },
  // If guided, what guide used
  guide: {
    name: String,
    source: String
  },
  // Music/sounds used
  sounds: [String],
  // Mood before and after
  moodBefore: {
    type: String,
    enum: ['😄', '😊', '😐', '😔', '😢', '😡', '🥳', '😌', '🤔', '😴']
  },
  moodAfter: {
    type: String,
    enum: ['😄', '😊', '😐', '😔', '😢', '😡', '🥳', '😌', '🤔', '😴']
  },
  // Streak tracking
  streak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
MeditationSessionSchema.index({ userId: 1, date: -1 });

// Virtual for actual vs planned ratio
MeditationSessionSchema.virtual('completionRatio').get(function() {
  if (!this.plannedDuration) return 1;
  return Math.round((this.duration / this.plannedDuration) * 100);
});

// Virtual for session effectiveness score
MeditationSessionSchema.virtual('effectivenessScore').get(function() {
  let score = this.quality || 3;
  if (this.completedFully) score += 1;
  if (this.focusRating) score += this.focusRating;
  if (this.calmRating) score += this.calmRating;
  return Math.round((score / 8) * 100);
});

// Pre-save middleware to set time of day
MeditationSessionSchema.pre('save', function(next) {
  if (this.startTime) {
    const hour = this.startTime.getHours();
    if (hour >= 5 && hour < 12) this.timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) this.timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) this.timeOfDay = 'evening';
    else this.timeOfDay = 'night';
  }
  next();
});

// Static method to get daily stats
MeditationSessionSchema.statics.getDailyStats = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const sessions = await this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const completedSessions = sessions.filter(s => s.completedFully).length;
  const avgQuality = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length
    : 0;
  
  // Group by type
  const byType = {};
  sessions.forEach(s => {
    if (!byType[s.type]) byType[s.type] = { sessions: 0, minutes: 0 };
    byType[s.type].sessions += 1;
    byType[s.type].minutes += s.duration;
  });
  
  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    completedSessions,
    avgQuality: Math.round(avgQuality * 10) / 10,
    byType,
    sessions
  };
};

// Static method to get weekly stats
MeditationSessionSchema.statics.getWeeklyStats = async function(userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const sessions = await this.find({
    userId,
    date: { $gte: startDate, $lt: endDate }
  }).sort({ date: -1 });
  
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const completedSessions = sessions.filter(s => s.completedFully).length;
  
  // Daily breakdown
  const dailyData = {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => dailyData[day] = { sessions: 0, minutes: 0 });
  
  sessions.forEach(s => {
    const day = days[s.date.getDay()];
    dailyData[day].sessions += 1;
    dailyData[day].minutes += s.duration;
  });
  
  // Most common type
  const typeCounts = {};
  sessions.forEach(s => {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
  });
  const mostCommonType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];
  
  // Streak calculation
  let streak = 0;
  let checkDate = new Date(startDate);
  checkDate.setDate(checkDate.getDate() - 1);
  
  while (true) {
    const dayStart = new Date(checkDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const hasSession = await this.findOne({
      userId,
      date: { $gte: dayStart, $lte: dayEnd }
    });
    
    if (hasSession) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    completedSessions,
    daysWithSession: sessions.length,
    avgPerDay: Math.round((totalMinutes / 7) * 10) / 10,
    mostCommonType,
    streak,
    dailyData,
    sessions
  };
};

// Static method to get monthly summary
MeditationSessionSchema.statics.getMonthlySummary = async function(userId, year, month) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  
  const sessions = await this.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const daysMeditated = new Set(sessions.map(s => s.date.toDateString())).size;
  const daysInMonth = endOfMonth.getDate();
  
  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    daysMeditated,
    daysInMonth,
    meditationDaysPercentage: Math.round((daysMeditated / daysInMonth) * 100),
    totalSessions: sessions.length,
    avgSessionLength: Math.round(totalMinutes / sessions.length) || 0
  };
};

module.exports = mongoose.model('MeditationSession', MeditationSessionSchema);

