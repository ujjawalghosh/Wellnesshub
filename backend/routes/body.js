const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BodyMetrics = require('../models/BodyMetrics');

// Get body metrics
router.get('/', auth, async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const metrics = await BodyMetrics.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest metrics
router.get('/latest', auth, async (req, res) => {
  try {
    const metrics = await BodyMetrics.findOne({
      userId: req.user.id
    }).sort({ date: -1 });
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/update body metrics
router.post('/', auth, async (req, res) => {
  try {
    const { weight, measurements, bodyFat, height, goalWeight, notes, tags, composition, bloodPressure, restingHeartRate, temperature } = req.body;
    
    const metrics = new BodyMetrics({
      userId: req.user.id,
      weight,
      measurements,
      bodyFat,
      height,
      goalWeight,
      notes,
      tags,
      composition,
      bloodPressure,
      restingHeartRate,
      temperature
    });
    
    await metrics.save();
    res.status(201).json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update body metrics
router.put('/:id', auth, async (req, res) => {
  try {
    const metrics = await BodyMetrics.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!metrics) {
      return res.status(404).json({ message: 'Body metrics not found' });
    }
    
    const { weight, measurements, bodyFat, height, goalWeight, notes, tags, composition, bloodPressure, restingHeartRate, temperature } = req.body;
    
    if (weight) metrics.weight = weight;
    if (measurements) metrics.measurements = measurements;
    if (bodyFat) metrics.bodyFat = bodyFat;
    if (height) metrics.height = height;
    if (goalWeight) metrics.goalWeight = goalWeight;
    if (notes) metrics.notes = notes;
    if (tags) metrics.tags = tags;
    if (composition) metrics.composition = composition;
    if (bloodPressure) metrics.bloodPressure = bloodPressure;
    if (restingHeartRate) metrics.restingHeartRate = restingHeartRate;
    if (temperature) metrics.temperature = temperature;
    
    await metrics.save();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete body metrics
router.delete('/:id', auth, async (req, res) => {
  try {
    const metrics = await BodyMetrics.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!metrics) {
      return res.status(404).json({ message: 'Body metrics not found' });
    }
    
    res.json({ message: 'Body metrics deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weight history
router.get('/weight/history', auth, async (req, res) => {
  try {
    const { days = 90 } = req.query;
    
    const history = await BodyMetrics.getWeightHistory(req.user.id, parseInt(days));
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get measurements history
router.get('/measurements/history', auth, async (req, res) => {
  try {
    const { days = 90 } = req.query;
    
    const history = await BodyMetrics.getMeasurementsHistory(req.user.id, parseInt(days));
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get progress summary
router.get('/progress', auth, async (req, res) => {
  try {
    const metrics = await BodyMetrics.findOne({
      userId: req.user.id
    }).sort({ date: -1 });
    
    if (!metrics) {
      return res.json({ message: 'No metrics recorded yet' });
    }
    
    const weightHistory = await BodyMetrics.getWeightHistory(req.user.id, 90);
    
    res.json({
      current: metrics,
      weightHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

