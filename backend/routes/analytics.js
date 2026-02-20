const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const WellnessPlan = require('../models/WellnessPlan');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Get overall progress
router.get('/progress', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Get habits
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Calculate completion data
    const completionData = [];
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dayCompletions = habits.filter(h => 
        h.completions.some(c => {
          const cDate = new Date(c.date);
          cDate.setHours(0, 0, 0, 0);
          const targetDate = new Date(d);
          targetDate.setHours(0, 0, 0, 0);
          return cDate.getTime() === targetDate.getTime();
        })
      ).length;

      completionData.push({
        date: new Date(d).toISOString().split('T')[0],
        completed: dayCompletions,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((dayCompletions / habits.length) * 100) : 0
      });
    }

    // Get challenges
    const challenges = await Challenge.find({
      'participants.user': req.user._id
    });

    const activeChallenges = challenges.filter(c => !c.isCompleted).length;
    const completedChallenges = challenges.filter(c => c.isCompleted).length;

    // Get user stats
    const user = await User.findById(req.user._id);

    res.json({
      completionData,
      habits: {
        total: habits.length,
        totalStreak: habits.reduce((sum, h) => sum + h.streak, 0),
        longestStreak: Math.max(...habits.map(h => h.longestStreak), 0)
      },
      challenges: {
        active: activeChallenges,
        completed: completedChallenges
      },
      user: {
        points: user.points,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly report
router.get('/weekly-report', auth, async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    // Get habits completed this week
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    
    let totalCompletions = 0;
    let perfectDays = 0;
    const daysWithCompletions = [];

    for (let d = new Date(weekAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dayCompletions = habits.filter(h => 
        h.completions.some(c => {
          const cDate = new Date(c.date);
          cDate.setHours(0, 0, 0, 0);
          const targetDate = new Date(d);
          targetDate.setHours(0, 0, 0, 0);
          return cDate.getTime() === targetDate.getTime();
        })
      ).length;

      totalCompletions += dayCompletions;
      daysWithCompletions.push(dayCompletions);

      if (habits.length > 0 && dayCompletions === habits.length) {
        perfectDays++;
      }
    }

    // Get challenges
    const challenges = await Challenge.find({
      'participants.user': req.user._id,
      createdAt: { $gte: weekAgo }
    });

    // Calculate achievements
    const achievements = [];
    if (totalCompletions >= habits.length * 5) {
      achievements.push('Consistency King');
    }
    if (perfectDays >= 5) {
      achievements.push('Perfect Week');
    }
    if (challenges.length > 0) {
      achievements.push('Challenge Joiner');
    }

    // Calculate improvement
    const avgCompletions = totalCompletions / 7;
    const completionRate = habits.length > 0 ? Math.round((avgCompletions / habits.length) * 100) : 0;

    res.json({
      week: {
        totalCompletions,
        perfectDays,
        totalHabits: habits.length,
        completionRate,
        avgPerDay: avgCompletions.toFixed(1)
      },
      challenges: {
        joined: challenges.length,
        active: challenges.filter(c => !c.isCompleted).length,
        completed: challenges.filter(c => c.isCompleted).length
      },
      achievements,
      motivation: getMotivationalMessage(completionRate, perfectDays),
      daysData: daysWithCompletions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get streak calendar
router.get('/streak-calendar', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const calendar = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      date.setHours(0, 0, 0, 0);

      const completions = habits.filter(h => 
        h.completions.some(c => {
          const cDate = new Date(c.date);
          cDate.setHours(0, 0, 0, 0);
          return cDate.getTime() === date.getTime();
        })
      ).length;

      calendar.push({
        date: date.toISOString().split('T')[0],
        day,
        completed: completions,
        total: habits.length,
        isPerfect: habits.length > 0 && completions === habits.length
      });
    }

    res.json({
      month: targetMonth,
      year: targetYear,
      calendar
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard summary
router.get('/dashboard', auth, async (req, res) => {
  try {
    console.log('Fetching dashboard for user:', req.user._id);
    
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    console.log('Habits found:', habits.length);
    
    const user = await User.findById(req.user._id);
    console.log('User found:', user ? user.name : 'NOT FOUND');
    
    // Today's habits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayHabits = habits.map(h => ({
      ...h.toObject(),
      completedToday: h.completions.some(c => {
        const cDate = new Date(c.date);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === today.getTime();
      })
    }));

    // Active challenges
    const challenges = await Challenge.find({
      'participants.user': req.user._id,
      isCompleted: false
    });
    console.log('Challenges found:', challenges.length);

    // Active plan
    const plan = await WellnessPlan.findOne({
      userId: req.user._id,
      isActive: true
    });
    console.log('Plan found:', plan ? 'yes' : 'no');

    res.json({
      user: {
        name: user.name,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        badges: user.badges
      },
      habits: {
        total: habits.length,
        todayCompleted: todayHabits.filter(h => h.completedToday).length,
        list: todayHabits
      },
      challenges: {
        active: challenges.length,
        list: challenges.slice(0, 3)
      },
      plan: plan || null
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function for motivational messages
function getMotivationalMessage(completionRate, perfectDays) {
  if (completionRate >= 80 && perfectDays >= 5) {
    return "Outstanding week! You're absolutely crushing your goals. Keep up the amazing work!";
  } else if (completionRate >= 60) {
    return "Great progress this week! You're building strong habits. Stay consistent!";
  } else if (completionRate >= 40) {
    return "Good effort this week! Every small step counts. Let's aim higher next week!";
  } else {
    return "New week, new opportunity! Start fresh and focus on one habit at a time.";
  }
}

module.exports = router;
