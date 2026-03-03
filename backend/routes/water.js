const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WaterIntake = require('../models/WaterIntake');

// Get today's water intake
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let waterIntake = await WaterIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!waterIntake) {
      waterIntake = new WaterIntake({
        userId: req.user.id,
        date: today
      });
      await waterIntake.save();
    }
    
    res.json(waterIntake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add water intake
router.post('/add', auth, async (req, res) => {
  try {
    const { amount, unit = 'ml' } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let waterIntake = await WaterIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!waterIntake) {
      waterIntake = new WaterIntake({
        userId: req.user.id,
        date: today
      });
    }
    
    await waterIntake.addIntake(amount, unit);
    await waterIntake.checkStreak();
    
    res.json(waterIntake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update water goal
router.put('/goal', auth, async (req, res) => {
  try {
    const { goalMl } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let waterIntake = await WaterIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!waterIntake) {
      waterIntake = new WaterIntake({
        userId: req.user.id,
        date: today,
        goalMl
      });
    } else {
      waterIntake.goalMl = goalMl;
    }
    
    await waterIntake.save();
    res.json(waterIntake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update reminders settings
router.put('/reminders', auth, async (req, res) => {
  try {
    const { enabled, intervalMinutes, startHour, endHour } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let waterIntake = await WaterIntake.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!waterIntake) {
      waterIntake = new WaterIntake({
        userId: req.user.id,
        date: today,
        reminders: { enabled, intervalMinutes, startHour, endHour }
      });
    } else {
      waterIntake.reminders = { enabled, intervalMinutes, startHour, endHour };
    }
    
    await waterIntake.save();
    res.json(waterIntake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get water history
router.get('/history', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);
    
    const history = await WaterIntake.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly stats
router.get('/stats', auth, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    
    const history = await WaterIntake.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    const totalMl = history.reduce((sum, w) => sum + w.totalMl, 0);
    const avgMl = history.length > 0 ? totalMl / history.length : 0;
    const daysGoalMet = history.filter(w => w.totalMl >= w.goalMl).length;
    const currentStreak = history[0]?.streak || 0;
    
    res.json({
      totalMl,
      avgMl: Math.round(avgMl),
      daysGoalMet,
      currentStreak,
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

