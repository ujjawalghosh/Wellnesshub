const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SleepLog = require('../models/SleepLog');

// Get sleep logs
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const logs = await SleepLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's sleep log
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let sleepLog = await SleepLog.findOne({
      userId: req.user.id,
      date: { $gte: today }
    }).sort({ date: -1 });
    
    res.json(sleepLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create sleep log
router.post('/', auth, async (req, res) => {
  try {
    const { bedtime, wakeTime, quality, notes, dream, factors, goalHours, sleepStages } = req.body;
    
    const sleepLog = new SleepLog({
      userId: req.user.id,
      bedtime: new Date(bedtime),
      wakeTime: new Date(wakeTime),
      quality,
      notes,
      dream,
      factors,
      goalHours,
      sleepStages
    });
    
    await sleepLog.save();
    res.status(201).json(sleepLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update sleep log
router.put('/:id', auth, async (req, res) => {
  try {
    const sleepLog = await SleepLog.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!sleepLog) {
      return res.status(404).json({ message: 'Sleep log not found' });
    }
    
    const { quality, notes, dream, factors } = req.body;
    if (quality) sleepLog.quality = quality;
    if (notes) sleepLog.notes = notes;
    if (dream) sleepLog.dream = dream;
    if (factors) sleepLog.factors = factors;
    
    await sleepLog.save();
    res.json(sleepLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete sleep log
router.delete('/:id', auth, async (req, res) => {
  try {
    const sleepLog = await SleepLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!sleepLog) {
      return res.status(404).json({ message: 'Sleep log not found' });
    }
    
    res.json({ message: 'Sleep log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly stats
router.get('/stats/weekly', auth, async (req, res) => {
  try {
    const { startDate } = req.query;
    const date = startDate ? new Date(startDate) : new Date();
    
    const stats = await SleepLog.getWeeklyStats(req.user.id, date);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sleep insights
router.get('/insights', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const logs = await SleepLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    if (logs.length === 0) {
      return res.json({ message: 'No sleep data available', logs: [] });
    }
    
    // Calculate averages
    const avgDuration = logs.reduce((sum, l) => sum + l.duration, 0) / logs.length;
    const avgQuality = logs.reduce((sum, l) => sum + l.quality, 0) / logs.length;
    
    // Find best/worst days
    const sortedByQuality = [...logs].sort((a, b) => b.quality - a.quality);
    const bestDay = sortedByQuality[0];
    const worstDay = sortedByQuality[sortedByQuality.length - 1];
    
    // Factor analysis
    const factorCounts = {};
    logs.forEach(log => {
      (log.factors || []).forEach(factor => {
        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
      });
    });
    
    res.json({
      totalLogs: logs.length,
      averageHours: Math.round((avgDuration / 60) * 10) / 10,
      averageQuality: Math.round(avgQuality * 10) / 10,
      bestDay: {
        date: bestDay.date,
        hours: Math.round((bestDay.duration / 60) * 10) / 10,
        quality: bestDay.quality
      },
      worstDay: {
        date: worstDay.date,
        hours: Math.round((worstDay.duration / 60) * 10) / 10,
        quality: worstDay.quality
      },
      commonFactors: Object.entries(factorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([factor, count]) => ({ factor, count })),
      logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

