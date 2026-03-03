const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PomodoroSession = require('../models/PomodoroSession');

// Get today's sessions
router.get('/today', auth, async (req, res) => {
  try {
    const stats = await PomodoroSession.getDailyStats(req.user.id, new Date());
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sessions
router.get('/', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const sessions = await PomodoroSession.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start a pomodoro session
router.post('/start', auth, async (req, res) => {
  try {
    const { type = 'work', settings, task } = req.body;
    
    const session = new PomodoroSession({
      userId: req.user.id,
      type,
      settings: settings || {},
      startTime: new Date(),
      task,
      status: 'running'
    });
    
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End a pomodoro session
router.post('/end/:id', auth, async (req, res) => {
  try {
    const session = await PomodoroSession.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    const { productivityRating, energyBefore, energyAfter, distractions, breakTaken, breakDuration } = req.body;
    
    session.endTime = new Date();
    session.status = 'completed';
    
    if (productivityRating) session.productivityRating = productivityRating;
    if (energyBefore) session.energyBefore = energyBefore;
    if (energyAfter) session.energyAfter = energyAfter;
    if (distractions !== undefined) session.distractions = distractions;
    if (breakTaken !== undefined) session.breakTaken = breakTaken;
    if (breakDuration) session.breakDuration = breakDuration;
    
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a session
router.post('/cancel/:id', auth, async (req, res) => {
  try {
    const session = await PomodoroSession.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    session.endTime = new Date();
    session.status = 'cancelled';
    
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly stats
router.get('/stats/weekly', auth, async (req, res) => {
  try {
    const { startDate } = req.query;
    const date = startDate ? new Date(startDate) : new Date();
    
    const stats = await PomodoroSession.getWeeklyStats(req.user.id, date);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get streak
router.get('/streak', auth, async (req, res) => {
  try {
    const streak = await PomodoroSession.getStreak(req.user.id);
    res.json({ streak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active (running) session
router.get('/active', auth, async (req, res) => {
  try {
    const session = await PomodoroSession.findOne({
      userId: req.user.id,
      status: 'running'
    }).sort({ startTime: -1 });
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

