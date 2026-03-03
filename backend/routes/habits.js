const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const User = require('../models/User');

// Get all habits for user
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new habit
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, frequency, targetDays, reminder, color, icon } = req.body;

    const habit = new Habit({
      userId: req.user._id,
      name,
      description,
      category,
      frequency,
      targetDays: targetDays || [0, 1, 2, 3, 4, 5, 6],
      reminder,
      color,
      icon
    });

    await habit.save();

    // Award points for creating a habit
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

    res.status(201).json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get habit by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update habit
router.put('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete habit for today
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check if already completed today - simplified date comparison
    const todayStr = new Date().toISOString().split('T')[0];
    
    const alreadyCompleted = habit.completions && habit.completions.some(completion => {
      const completionDateStr = new Date(completion.date).toISOString().split('T')[0];
      return completionDateStr === todayStr;
    });

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Habit already completed today' });
    }

    // Add completion
    const newCompletion = {
      date: new Date(),
      completed: true,
      notes: req.body.notes || ''
    };
    
    if (!habit.completions) {
      habit.completions = [];
    }
    habit.completions.push(newCompletion);

    // For first completion, set streak to 1
    if (habit.completions.length === 1) {
      habit.streak = 1;
    } else {
      // Update streak for subsequent completions
      habit.updateStreak();
    }

    // Update longest streak if needed
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }
    
    // Update total completions
    habit.totalCompletions = habit.completions.length;

    await habit.save();

    // Award points
    const user = await User.findById(req.user._id);
    const leveledUp = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { points: 5 } },
      { new: true }
    );

    // Check for badges (badges are stored as objects with name property)
    const newBadges = [];
    const userBadgeNames = user.badges.map(b => b.name);
    if (habit.streak >= 7 && !userBadgeNames.includes('streak_7')) {
      newBadges.push({ name: 'streak_7', description: '7 day streak' });
    }
    if (habit.streak >= 30 && !userBadgeNames.includes('streak_30')) {
      newBadges.push({ name: 'streak_30', description: '30 day streak' });
    }
    if (habit.streak >= 100 && !userBadgeNames.includes('streak_100')) {
      newBadges.push({ name: 'streak_100', description: '100 day streak' });
    }

    if (newBadges.length > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { badges: { $each: newBadges } }
      });
    }

    res.json({
      habit,
      leveledUp: leveledUp.level > user.level,
      newLevel: leveledUp.level,
      newBadges
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get habit stats
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    
    const totalHabits = habits.length;
    const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
    const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak || 0), 0) : 0;
    const totalCompletions = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0);

    // Today's completion
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCompleted = habits.filter(h => {
      if (!h.completions || h.completions.length === 0) return false;
      return h.completions.some(c => {
        const cDate = new Date(c.date);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === today.getTime();
      });
    }).length;

    res.json({
      totalHabits,
      totalStreak,
      longestStreak,
      totalCompletions,
      todayCompleted,
      completionRate: totalHabits > 0 ? Math.round((todayCompleted / totalHabits) * 100) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
