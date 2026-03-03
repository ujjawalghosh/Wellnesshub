const express = require('express');
const router = express.Router();
const DailyAffirmation = require('../models/DailyAffirmation');
const affirmationsData = require('../data/affirmations');

// Seed affirmations (run once to populate database)
router.post('/seed', async (req, res) => {
  try {
    const count = await DailyAffirmation.countDocuments();
    
    if (count > 0) {
      return res.json({ message: 'Affirmations already seeded', count });
    }
    
    // Insert all affirmations
    await DailyAffirmation.insertMany(affirmationsData);
    
    res.json({ message: 'Affirmations seeded successfully', count: affirmationsData.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get daily affirmation
router.get('/daily', async (req, res) => {
  try {
    let affirmation = await DailyAffirmation.getDailyAffirmation();
    
    // If no affirmations in DB, seed and try again
    if (!affirmation) {
      await DailyAffirmation.insertMany(affirmationsData);
      affirmation = await DailyAffirmation.getDailyAffirmation();
    }
    
    res.json(affirmation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get random affirmation
router.get('/random', async (req, res) => {
  try {
    const { category } = req.query;
    const affirmation = await DailyAffirmation.getRandomAffirmation(category);
    
    if (!affirmation) {
      // If no affirmations in DB, return from data directly
      const random = affirmationsData[Math.floor(Math.random() * affirmationsData.length)];
      return res.json(random);
    }
    
    res.json(affirmation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get affirmations by category
router.get('/category/:category', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const affirmations = await DailyAffirmation.getByCategory(req.params.category, parseInt(limit));
    res.json(affirmations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { name: 'motivation', icon: '🚀', description: 'Daily motivation' },
      { name: 'health', icon: '💪', description: 'Health and wellness' },
      { name: 'self-love', icon: '❤️', description: 'Self-love and acceptance' },
      { name: 'success', icon: '🏆', description: 'Success and achievement' },
      { name: 'gratitude', icon: '🙏', description: 'Gratitude and appreciation' },
      { name: 'mindfulness', icon: '🧘', description: 'Mindfulness and presence' },
      { name: 'confidence', icon: '💫', description: 'Confidence and self-belief' },
      { name: 'productivity', icon: '⚡', description: 'Productivity and focus' },
      { name: 'relationships', icon: '🤝', description: 'Relationships and connection' },
      { name: 'spiritual', icon: '✨', description: 'Spiritual growth' }
    ];
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured affirmations
router.get('/featured', async (req, res) => {
  try {
    const affirmations = await DailyAffirmation.find({ featured: true }).limit(10);
    
    if (affirmations.length === 0) {
      return res.json(affirmationsData.filter(a => a.featured).slice(0, 10));
    }
    
    res.json(affirmations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rate an affirmation
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    
    const affirmation = await DailyAffirmation.findById(req.params.id);
    
    if (!affirmation) {
      return res.status(404).json({ message: 'Affirmation not found' });
    }
    
    // Update average rating
    const newCount = affirmation.ratingCount + 1;
    const newAverage = ((affirmation.averageRating * affirmation.ratingCount) + rating) / newCount;
    
    affirmation.averageRating = Math.round(newAverage * 10) / 10;
    affirmation.ratingCount = newCount;
    
    await affirmation.save();
    res.json(affirmation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

