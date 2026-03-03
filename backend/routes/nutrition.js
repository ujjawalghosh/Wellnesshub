const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const NutritionLog = require('../models/NutritionLog');

// Get today's nutrition
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nutritionLog = await NutritionLog.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!nutritionLog) {
      nutritionLog = new NutritionLog({
        userId: req.user.id,
        date: today
      });
      await nutritionLog.save();
    }
    
    res.json(nutritionLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get nutrition logs
router.get('/', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const logs = await NutritionLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add meal to today's nutrition
router.post('/meal', auth, async (req, res) => {
  try {
    const { mealType, foods, notes } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nutritionLog = await NutritionLog.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!nutritionLog) {
      nutritionLog = new NutritionLog({
        userId: req.user.id,
        date: today
      });
    }
    
    nutritionLog.meals.push({
      type: mealType,
      time: new Date(),
      foods,
      notes
    });
    
    await nutritionLog.save();
    res.json(nutritionLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update meal
router.put('/meal/:mealId', auth, async (req, res) => {
  try {
    const { foods, notes } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nutritionLog = await NutritionLog.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!nutritionLog) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }
    
    const meal = nutritionLog.meals.id(req.params.mealId);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    if (foods) meal.foods = foods;
    if (notes !== undefined) meal.notes = notes;
    
    await nutritionLog.save();
    res.json(nutritionLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete meal
router.delete('/meal/:mealId', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nutritionLog = await NutritionLog.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!nutritionLog) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }
    
    nutritionLog.meals.pull(req.params.mealId);
    await nutritionLog.save();
    res.json(nutritionLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update water intake
router.put('/water', auth, async (req, res) => {
  try {
    const { water } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nutritionLog = await NutritionLog.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!nutritionLog) {
      nutritionLog = new NutritionLog({
        userId: req.user.id,
        date: today,
        water
      });
    } else {
      nutritionLog.water = water;
    }
    
    await nutritionLog.save();
    res.json(nutritionLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update goals
router.put('/goals', auth, async (req, res) => {
  try {
    const { goals } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nutritionLog = await NutritionLog.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!nutritionLog) {
      nutritionLog = new NutritionLog({
        userId: req.user.id,
        date: today,
        goals
      });
    } else {
      nutritionLog.goals = goals;
    }
    
    await nutritionLog.save();
    res.json(nutritionLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly averages
router.get('/stats/weekly', auth, async (req, res) => {
  try {
    const { startDate } = req.query;
    const date = startDate ? new Date(startDate) : new Date();
    
    const stats = await NutritionLog.getWeeklyAverages(req.user.id, date);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quick add common food
router.post('/quick-add', auth, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, mealType = 'snack' } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nutritionLog = await NutritionLog.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!nutritionLog) {
      nutritionLog = new NutritionLog({
        userId: req.user.id,
        date: today
      });
    }
    
    nutritionLog.meals.push({
      type: mealType,
      time: new Date(),
      foods: [{
        name,
        calories,
        protein,
        carbs,
        fat,
        serving: { amount: 1, unit: 'serving' }
      }]
    });
    
    await nutritionLog.save();
    res.json(nutritionLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

