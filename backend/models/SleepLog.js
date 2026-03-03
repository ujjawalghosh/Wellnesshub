const mongoose = require('mongoose');

const SleepLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  bedtime: {
    type: Date,
    required: true
  },
  wakeTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  quality: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  notes: {
    type: String,
    maxlength: 500
  },
  dream: {
    type: String,
    maxlength: 1000
  },
  factors: [{
    type: String,
    enum: ['stress', 'caffeine', 'exercise', 'screen_time', 'late_meal', 'alcohol', 'medication', 'noise', 'temperature', 'other']
  }],
  // Sleep stages (if tracked with wearable)
  sleepStages: {
    deep: Number, // minutes
    light: Number,
    rem: Number,
    awake: Number
  },
  // Goal tracking
  goalHours: {
    type: Number,
    default: 8
  },
  // Weekly stats (calculated)
  weeklyAverage: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
SleepLogSchema.index({ userId: 1, date: -1 });

// Virtual for hours of sleep
SleepLogSchema.virtual('hours').get(function() {
  return Math.round((this.duration / 60) * 10) / 10;
});

// Virtual for goal achievement percentage
SleepLogSchema.virtual('goalPercentage').get(function() {
  return Math.min(Math.round((this.duration / (this.goalHours * 60)) * 100), 100);
});

// Virtual for quality description
SleepLogSchema.virtual('qualityDescription').get(function() {
  const descriptions = {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Fair',
    4: 'Good',
    5: 'Excellent'
  };
  return descriptions[this.quality] || 'Unknown';
});

// Pre-save middleware to calculate duration
SleepLogSchema.pre('save', function(next) {
  if (this.bedtime && this.wakeTime) {
    const diff = this.wakeTime - this.bedtime;
    this.duration = Math.round(diff / 60000); // Convert to minutes
  }
  next();
});

// Static method to get weekly stats
SleepLogSchema.statics.getWeeklyStats = async function(userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const logs = await this.find({
    userId,
    date: { $gte: startDate, $lt: endDate }
  }).sort({ date: -1 });
  
  if (logs.length === 0) return null;
  
  const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0);
  const avgQuality = logs.reduce((sum, log) => sum + log.quality, 0) / logs.length;
  
  return {
    averageHours: Math.round((totalMinutes / logs.length / 60) * 10) / 10,
    averageQuality: Math.round(avgQuality * 10) / 10,
    totalLogs: logs.length,
    daysTracked: logs.length,
    logs
  };
};

module.exports = mongoose.model('SleepLog', SleepLogSchema);

