const mongoose = require('mongoose');

const BodyMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Weight tracking
  weight: {
    value: Number, // in kg
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  // Body measurements (in cm)
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    calves: Number,
    neck: Number,
    shoulders: Number
  },
  // Body fat
  bodyFat: {
    percentage: Number,
    method: {
      type: String,
      enum: ['calipers', 'scale', 'DEXA', 'hydrostatic', 'other']
    }
  },
  // BMI calculation
  bmi: {
    type: Number
  },
  // Height (for BMI calculation)
  height: {
    value: Number, // in cm
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm'
    }
  },
  // Progress photos reference
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgressPhoto'
  },
  // Goals
  goalWeight: {
    value: Number,
    unit: String
  },
  // Notes
  notes: {
    type: String,
    maxlength: 1000
  },
  // Tags for categorization
  tags: [String],
  // Water weight, muscle mass, etc (from smart scales)
  composition: {
    waterPercentage: Number,
    muscleMass: Number,
    boneMass: Number,
    visceralFat: Number,
    metabolicAge: Number,
    basalMetabolicRate: Number
  },
  // Blood pressure (optional)
  bloodPressure: {
    systolic: Number,
    diastolic: Number,
    pulse: Number
  },
  // Heart rate at rest
  restingHeartRate: Number,
  // Temperature
  temperature: Number, // in Celsius
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
BodyMetricsSchema.index({ userId: 1, date: -1 });

// Pre-save middleware to calculate BMI
BodyMetricsSchema.pre('save', function(next) {
  if (this.weight && this.height) {
    // Convert height to meters
    const heightM = this.height.unit === 'ft' ? this.height.value * 30.48 : this.height.value;
    const weightKg = this.weight.unit === 'lbs' ? this.weight.value * 0.453592 : this.weight.value;
    
    // Calculate BMI: weight(kg) / height(m)^2
    this.bmi = Math.round((weightKg / Math.pow(heightM / 100, 2)) * 10) / 10;
  }
  next();
});

// Virtual for weight in lbs
BodyMetricsSchema.virtual('weightLbs').get(function() {
  if (!this.weight) return null;
  return this.weight.unit === 'kg' 
    ? Math.round(this.weight.value * 2.20462 * 10) / 10
    : this.weight.value;
});

// Virtual for weight in kg
BodyMetricsSchema.virtual('weightKg').get(function() {
  if (!this.weight) return null;
  return this.weight.unit === 'lbs'
    ? Math.round(this.weight.value * 0.453592 * 10) / 10
    : this.weight.value;
});

// Virtual for BMI category
BodyMetricsSchema.virtual('bmiCategory').get(function() {
  if (!this.bmi) return null;
  if (this.bmi < 18.5) return 'Underweight';
  if (this.bmi < 25) return 'Normal';
  if (this.bmi < 30) return 'Overweight';
  return 'Obese';
});

// Virtual for weight progress
BodyMetricsSchema.virtual('weightProgress').get(function() {
  // This will be calculated in queries
  return null;
});

// Static method to get weight history
BodyMetricsSchema.statics.getWeightHistory = async function(userId, days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const metrics = await this.find({
    userId,
    date: { $gte: startDate },
    'weight.value': { $exists: true }
  }).sort({ date: 1 });
  
  if (metrics.length < 2) return null;
  
  const first = metrics[0];
  const last = metrics[metrics.length - 1];
  
  const firstKg = first.weight.unit === 'lbs' ? first.weight.value * 0.453592 : first.weight.value;
  const lastKg = last.weight.unit === 'lbs' ? last.weight.value * 0.453592 : last.weight.value;
  
  return {
    startWeight: first.weight,
    currentWeight: last.weight,
    change: Math.round((lastKg - firstKg) * 10) / 10,
    changeUnit: 'kg',
    percentChange: Math.round(((lastKg - firstKg) / firstKg) * 1000) / 10,
    dataPoints: metrics.length,
    history: metrics.map(m => ({
      date: m.date,
      weight: m.weight,
      bmi: m.bmi
    }))
  };
};

// Static method to get measurements history
BodyMetricsSchema.statics.getMeasurementsHistory = async function(userId, days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const metrics = await this.find({
    userId,
    date: { $gte: startDate },
    measurements: { $exists: true, $ne: {} }
  }).sort({ date: 1 });
  
  return {
    dataPoints: metrics.length,
    history: metrics.map(m => ({
      date: m.date,
      measurements: m.measurements
    }))
  };
};

module.exports = mongoose.model('BodyMetrics', BodyMetricsSchema);

