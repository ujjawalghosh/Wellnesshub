const mongoose = require('mongoose');

const DailyAffirmationSchema = new mongoose.Schema({
  // The affirmation text
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  // Category/tags
  category: {
    type: String,
    enum: ['motivation', 'health', 'self-love', 'success', 'gratitude', 'mindfulness', 'confidence', 'productivity', 'relationships', 'spiritual'],
    default: 'motivation'
  },
  // Author/source
  author: {
    type: String,
    maxlength: 100
  },
  // Whether it's featured
  featured: {
    type: Boolean,
    default: false
  },
  // Usage count (for popularity tracking)
  usageCount: {
    type: Number,
    default: 0
  },
  // Average rating from users
  averageRating: {
    type: Number,
    default: 0
  },
  // Number of ratings
  ratingCount: {
    type: Number,
    default: 0
  },
  // Translations (for i18n)
  translations: {
    es: String,
    fr: String,
    de: String,
    it: String,
    pt: String,
    zh: String,
    ja: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get daily affirmation
DailyAffirmationSchema.statics.getDailyAffirmation = async function() {
  // Get day of year for consistent daily rotation
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Use day of year to select affirmation
  const count = await this.countDocuments();
  if (count === 0) return null;
  
  const index = dayOfYear % count;
  const affirmation = await this.findOne()
    .skip(index)
    .sort({ usageCount: -1 });
  
  // Increment usage count
  if (affirmation) {
    affirmation.usageCount += 1;
    await affirmation.save();
  }
  
  return affirmation;
};

// Static method to get random affirmation
DailyAffirmationSchema.statics.getRandomAffirmation = async function(category = null) {
  const query = category ? { category } : {};
  const count = await this.countDocuments(query);
  
  if (count === 0) return null;
  
  const random = Math.floor(Math.random() * count);
  return this.findOne(query).skip(random);
};

// Static method to get affirmations by category
DailyAffirmationSchema.statics.getByCategory = async function(category, limit = 10) {
  return this.find({ category })
    .sort({ featured: -1, usageCount: -1 })
    .limit(limit);
};

module.exports = mongoose.model('DailyAffirmation', DailyAffirmationSchema);

