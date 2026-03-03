const mongoose = require('mongoose');

const NutritionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  meals: [{
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'brunch'],
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    },
    foods: [{
      name: {
        type: String,
        required: true
      },
      calories: Number,
      protein: Number, // in grams
      carbs: Number, // in grams
      fat: Number, // in grams
      fiber: Number, // in grams
      sugar: Number, // in grams
      sodium: Number, // in mg
      serving: {
        amount: Number,
        unit: String
      },
      notes: String
    }],
    notes: String
  }],
  // Daily totals
  totals: {
    calories: {
      type: Number,
      default: 0
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fat: {
      type: Number,
      default: 0
    },
    fiber: {
      type: Number,
      default: 0
    },
    sugar: {
      type: Number,
      default: 0
    },
    sodium: {
      type: Number,
      default: 0
    }
  },
  // Goals
  goals: {
    calories: {
      type: Number,
      default: 2000
    },
    protein: {
      type: Number,
      default: 50
    },
    carbs: {
      type: Number,
      default: 250
    },
    fat: {
      type: Number,
      default: 65
    }
  },
  // Water intake (in ml)
  water: {
    type: Number,
    default: 0
  },
  // Vitamins/supplements
  supplements: [{
    name: String,
    dosage: String,
    taken: {
      type: Boolean,
      default: false
    }
  }],
  // Notes
  notes: String,
  // Tags (e.g., 'cheat day', 'fasting', 'post-workout')
  tags: [String],
  // Meal quality rating
  mealQuality: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  // Hungry level before/after meals
  hungerBefore: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  hungerAfter: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
NutritionLogSchema.index({ userId: 1, date: -1 });

// Method to calculate totals from meals
NutritionLogSchema.methods.calculateTotals = function() {
  let totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };
  
  this.meals.forEach(meal => {
    meal.foods.forEach(food => {
      totals.calories += food.calories || 0;
      totals.protein += food.protein || 0;
      totals.carbs += food.carbs || 0;
      totals.fat += food.fat || 0;
      totals.fiber += food.fiber || 0;
      totals.sugar += food.sugar || 0;
      totals.sodium += food.sodium || 0;
    });
  });
  
  // Round to 1 decimal place
  Object.keys(totals).forEach(key => {
    totals[key] = Math.round(totals[key] * 10) / 10;
  });
  
  this.totals = totals;
  return this.totals;
};

// Virtual for calorie goal percentage
NutritionLogSchema.virtual('caloriePercentage').get(function() {
  if (!this.totals.calories || !this.goals.calories) return 0;
  return Math.round((this.totals.calories / this.goals.calories) * 100);
});

// Virtual for remaining calories
NutritionLogSchema.virtual('remainingCalories').get(function() {
  if (!this.totals.calories || !this.goals.calories) return 0;
  return this.goals.calories - this.totals.calories;
});

// Pre-save middleware to calculate totals
NutritionLogSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

// Static method to get daily nutrition
NutritionLogSchema.statics.getDailyNutrition = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const log = await this.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  
  return log;
};

// Static method to get weekly averages
NutritionLogSchema.statics.getWeeklyAverages = async function(userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const logs = await this.find({
    userId,
    date: { $gte: startDate, $lt: endDate }
  });
  
  if (logs.length === 0) return null;
  
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };
  
  logs.forEach(log => {
    totals.calories += log.totals.calories || 0;
    totals.protein += log.totals.protein || 0;
    totals.carbs += log.totals.carbs || 0;
    totals.fat += log.totals.fat || 0;
    totals.fiber += log.totals.fiber || 0;
  });
  
  const days = logs.length;
  Object.keys(totals).forEach(key => {
    totals[key] = Math.round((totals[key] / days) * 10) / 10;
  });
  
  return {
    averages: totals,
    daysTracked: logs.length,
    logs
  };
};

module.exports = mongoose.model('NutritionLog', NutritionLogSchema);

