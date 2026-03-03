const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MoodLog = require('../models/MoodLog');

// Get mood logs
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const logs = await MoodLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's mood
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const moodLog = await MoodLog.findOne({
      userId: req.user.id,
      date: { $gte: today }
    }).sort({ date: -1 });
    
    res.json(moodLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create mood log
router.post('/', auth, async (req, res) => {
  try {
    const { mood, moodScore, energyLevel, stressLevel, activities, notes, gratitude, tags, weather, location, sleepHours } = req.body;
    
    const moodLog = new MoodLog({
      userId: req.user.id,
      mood,
      moodScore,
      energyLevel,
      stressLevel,
      activities,
      notes,
      gratitude,
      tags,
      weather,
      location,
      sleepHours
    });
    
    await moodLog.save();
    res.status(201).json(moodLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update mood log
router.put('/:id', auth, async (req, res) => {
  try {
    const moodLog = await MoodLog.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!moodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }
    
    const { mood, moodScore, energyLevel, stressLevel, activities, notes, gratitude, tags } = req.body;
    if (mood) moodLog.mood = mood;
    if (moodScore) moodLog.moodScore = moodScore;
    if (energyLevel) moodLog.energyLevel = energyLevel;
    if (stressLevel) moodLog.stressLevel = stressLevel;
    if (activities) moodLog.activities = activities;
    if (notes) moodLog.notes = notes;
    if (gratitude) moodLog.gratitude = gratitude;
    if (tags) moodLog.tags = tags;
    
    await moodLog.save();
    res.json(moodLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete mood log
router.delete('/:id', auth, async (req, res) => {
  try {
    const moodLog = await MoodLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!moodLog) {
      return res.status(404).json({ message: 'Mood log not found' });
    }
    
    res.json({ message: 'Mood log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mood trends
router.get('/trends', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const trends = await MoodLog.getTrends(req.user.id, parseInt(days));
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly insights
router.get('/insights/weekly', auth, async (req, res) => {
  try {
    const insights = await MoodLog.getWeeklyInsights(req.user.id);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get calendar view (mood by day for month)
router.get('/calendar', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const logs = await MoodLog.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Group by day
    const calendar = {};
    for (let i = 1; i <= endDate.getDate(); i++) {
      calendar[i] = null;
    }
    
    logs.forEach(log => {
      calendar[log.date.getDate()] = {
        mood: log.mood,
        moodScore: log.moodScore,
        energyLevel: log.energyLevel,
        stressLevel: log.stressLevel
      };
    });
    
    res.json({
      year: parseInt(year),
      month: parseInt(month),
      daysInMonth: endDate.getDate(),
      data: calendar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

