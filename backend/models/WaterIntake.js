const mongoose = require('mongoose');

const WaterIntakeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  glasses: {
    type: Number,
    default: 0
  },
  totalMl: {
    type: Number,
    default: 0
  },
  goalMl: {
    type: Number,
    default: 2000 // Default 2L daily goal
  },
  history: [{
    time: {
      type: Date,
      default: Date.now
    },
    amount: Number, // in ml
    amountOz: Number // in ounces
  }],
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    intervalMinutes: {
      type: Number,
      default: 60
    },
    startHour: {
      type: Number,
      default: 8
    },
    endHour: {
      type: Number,
      default: 22
    }
  },
  lastDrankAt: {
    type: Date
  },
  streak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying by user and date
WaterIntakeSchema.index({ userId: 1, date: 1 });

// Virtual for percentage of goal achieved
WaterIntakeSchema.virtual('goalPercentage').get(function() {
  return Math.min(Math.round((this.totalMl / this.goalMl) * 100), 100);
});

// Method to add water intake
WaterIntakeSchema.methods.addIntake = function(amount, unit = 'ml') {
  const amountMl = unit === 'oz' ? amount * 29.5735 : amount;
  this.totalMl += amountMl;
  this.glasses += 1;
  this.lastDrankAt = new Date();
  this.history.push({
    time: new Date(),
    amount: amountMl,
    amountOz: amountMl / 29.5735
  });
  return this.save();
};

// Method to check and update streak
WaterIntakeSchema.methods.checkStreak = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.totalMl >= this.goalMl) {
    // Check if yesterday was also completed
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayLog = await this.constructor.findOne({
      userId: this.userId,
      date: {
        $gte: yesterday,
        $lt: today
      }
    });
    
    if (yesterdayLog && yesterdayLog.totalMl >= yesterdayLog.goalMl) {
      this.streak += 1;
    } else if (!yesterdayLog) {
      this.streak = 1;
    }
  }
  
  return this.save();
};

module.exports = mongoose.model('WaterIntake', WaterIntakeSchema);

