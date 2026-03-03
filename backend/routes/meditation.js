const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MeditationSession = require('../models/MeditationSession');

// Get today's sessions
router.get('/today', auth, async (req, res) => {
  try {
    const stats = await MeditationSession.getDailyStats(req.user.id, new Date());
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get meditation sessions
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const sessions = await MeditationSession.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start meditation session
router.post('/start', auth, async (req, res) => {
  try {
    const { type, plannedDuration, setting, posture, intention } = req.body;
    
    const session = new MeditationSession({
      userId: req.user.id,
      type: type || 'mindfulness',
      duration: 0,
      plannedDuration,
      startTime: new Date(),
      setting: setting || 'home',
      posture: posture || 'sitting',
      intention
    });
    
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End meditation session
router.post('/end/:id', auth, async (req, res) => {
  try {
    const session = await MeditationSession.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    const { duration, quality, focusRating, calmRating, distractions, feelings, insights, benefits, completedFully, moodAfter } = req.body;
    
    session.endTime = new Date();
    if (duration) session.duration = duration;
    if (quality) session.quality = quality;
    if (focusRating) session.focusRating = focusRating;
    if (calmRating) session.calmRating = calmRating;
    if (distractions) session.distractions = distractions;
    if (feelings) session.feelings = feelings;
    if (insights) session.insights = insights;
    if (benefits) session.benefits = benefits;
    if (completedFully !== undefined) session.completedFully = completedFully;
    if (moodAfter) session.moodAfter = moodAfter;
    
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel meditation session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await MeditationSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly stats
router.get('/stats/weekly', auth, async (req, res) => {
  try {
    const { startDate } = req.query;
    const date = startDate ? new Date(startDate) : new Date();
    
    const stats = await MeditationSession.getWeeklyStats(req.user.id, date);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly summary
router.get('/stats/monthly', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const summary = await MeditationSession.getMonthlySummary(
      req.user.id,
      parseInt(year),
      parseInt(month)
    );
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get streak
router.get('/streak', auth, async (req, res) => {
  try {
    const stats = await MeditationSession.getWeeklyStats(req.user.id, new Date());
    res.json({ streak: stats?.streak || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active session
router.get('/active', auth, async (req, res) => {
  try {
    const session = await MeditationSession.findOne({
      userId: req.user.id,
      endTime: null
    }).sort({ startTime: -1 });
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

