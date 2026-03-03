const mongoose = require('mongoose');

const MoodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mood: {
    type: String,
    enum: ['😄', '😊', '😐', '😔', '😢', '😡', '🥳', '😌', '🤔', '😴'],
    required: true
  },
  moodScore: {
    type: Number, // 1-10 scale
    min: 1,
    max: 10,
    required: true
  },
  energyLevel: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  stressLevel: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  activities: [{
    type: String,
    enum: ['work', 'exercise', 'meditation', 'social', 'hobby', 'family', 'outdoor', 'learning', 'creative', 'rest', 'travel', 'other']
  }],
  notes: {
    type: String,
    maxlength: 1000
  },
  gratitude: [{
    type: String,
    maxlength: 200
  }],
  tags: [String],
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'windy', 'foggy']
  },
  // Location context
  location: {
    type: String,
    maxlength: 100
  },
  // Sleep correlation
  sleepHours: Number,
  // Weekly/Monthly insights
  weeklyAverage: Number,
  monthlyAverage: Number,
  trend: {
    type: String,
    enum: ['improving', 'declining', 'stable'],
    default: 'stable'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
MoodLogSchema.index({ userId: 1, date: -1 });

// Virtual for mood emoji description
MoodLogSchema.virtual('moodDescription').get(function() {
  const descriptions = {
    '😄': 'Ecstatic',
    '😊': 'Happy',
    '😐': 'Neutral',
    '😔': 'Sad',
    '😢': 'Crying',
    '😡': 'Angry',
    '🥳': 'Excited',
    '😌': 'Calm',
    '🤔': 'Thoughtful',
    '😴': 'Tired'
  };
  return descriptions[this.mood] || 'Unknown';
});

// Static method to get mood trends
MoodLogSchema.statics.getTrends = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await this.find({
    userId,
    date: { $gte: startDate }
  }).sort({ date: -1 });
  
  if (logs.length < 3) return null;
  
  // Calculate average
  const avgMood = logs.reduce((sum, log) => sum + log.moodScore, 0) / logs.length;
  const avgEnergy = logs.reduce((sum, log) => sum + log.energyLevel, 0) / logs.length;
  const avgStress = logs.reduce((sum, log) => sum + log.stressLevel, 0) / logs.length;
  
  // Determine trend (compare first half vs second half)
  const midpoint = Math.floor(logs.length / 2);
  const recentHalf = logs.slice(0, midpoint);
  const olderHalf = logs.slice(midpoint);
  
  const recentAvg = recentHalf.reduce((sum, log) => sum + log.moodScore, 0) / recentHalf.length;
  const olderAvg = olderHalf.reduce((sum, log) => sum + log.moodScore, 0) / olderHalf.length;
  
  let trend = 'stable';
  if (recentAvg > olderAvg + 0.5) trend = 'improving';
  else if (recentAvg < olderAvg - 0.5) trend = 'declining';
  
  // Most common mood
  const moodCounts = {};
  logs.forEach(log => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });
  const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
    moodCounts[a] > moodCounts[b] ? a : b
  );
  
  // Most common activities
  const activityCounts = {};
  logs.forEach(log => {
    (log.activities || []).forEach(activity => {
      activityCounts[activity] = (activityCounts[activity] || 0) + 1;
    });
  });
  const topActivities = Object.keys(activityCounts)
    .sort((a, b) => activityCounts[b] - activityCounts[a])
    .slice(0, 5);
  
  return {
    averageMood: Math.round(avgMood * 10) / 10,
    averageEnergy: Math.round(avgEnergy * 10) / 10,
    averageStress: Math.round(avgStress * 10) / 10,
    totalLogs: logs.length,
    trend,
    mostCommonMood,
    topActivities,
    period: days
  };
};

// Static method to get weekly insights
MoodLogSchema.statics.getWeeklyInsights = async function(userId) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const logs = await this.find({
    userId,
    date: { $gte: startOfWeek }
  });
  
  if (logs.length === 0) return null;
  
  // Group by day
  const byDay = {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => byDay[day] = []);
  
  logs.forEach(log => {
    const day = days[log.date.getDay()];
    byDay[day].push(log.moodScore);
  });
  
  // Calculate daily averages
  const dailyData = days.map(day => ({
    day,
    scores: byDay[day],
    average: byDay[day].length > 0 
      ? Math.round((byDay[day].reduce((a, b) => a + b, 0) / byDay[day].length) * 10) / 10
      : null
  }));
  
  return {
    dailyData,
    totalEntries: logs.length,
    bestDay: dailyData.filter(d => d.average).sort((a, b) => b.average - a.average)[0]?.day || null,
    lowestDay: dailyData.filter(d => d.average).sort((a, b) => a.average - b.average)[0]?.day || null
  };
};

module.exports = mongoose.model('MoodLog', MoodLogSchema);

