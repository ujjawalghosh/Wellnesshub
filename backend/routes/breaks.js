const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mindful break suggestions (mock data - can be enhanced with AI)
const breakSuggestions = [
  {
    id: 1,
    type: 'stretch',
    title: 'Quick Stretch Break',
    duration: 2,
    instructions: [
      'Stand up and reach your arms above your head',
      'Slowly bend to the left, hold for 10 seconds',
      'Slowly bend to the right, hold for 10 seconds',
      'Roll your shoulders backwards 5 times',
      'Finish by taking 3 deep breaths'
    ],
    benefits: ['Relieves muscle tension', 'Improves circulation', 'Boosts energy']
  },
  {
    id: 2,
    type: 'breathing',
    title: '4-7-8 Breathing Exercise',
    duration: 3,
    instructions: [
      'Sit comfortably with your back straight',
      'Inhale through your nose for 4 seconds',
      'Hold your breath for 7 seconds',
      'Exhale slowly through your mouth for 8 seconds',
      'Repeat 3-4 times'
    ],
    benefits: ['Reduces stress', 'Calms the mind', 'Improves focus']
  },
  {
    id: 3,
    type: 'hydration',
    title: 'Hydration Reminder',
    duration: 1,
    instructions: [
      'Stand up and walk to the kitchen or water fountain',
      'Drink a full glass of water (8 oz / 250ml)',
      'Take a moment to appreciate the water',
      'Set a reminder for your next hydration break'
    ],
    benefits: ['Stays hydrated', 'Boosts metabolism', 'Improves mood']
  },
  {
    id: 4,
    type: 'meditation',
    title: '1-Minute Meditation',
    duration: 1,
    instructions: [
      'Close your eyes and find a comfortable position',
      'Focus on your breath, inhale and exhale slowly',
      'If thoughts arise, acknowledge them and return to breathing',
      'Continue for 1 minute',
      'Slowly open your eyes when ready'
    ],
    benefits: ['Reduces anxiety', 'Improves concentration', 'Promotes relaxation']
  },
  {
    id: 5,
    type: 'eyes',
    title: '20-20-20 Eye Break',
    duration: 2,
    instructions: [
      'Look away from your screen',
      'Focus on something 20 feet away',
      'Hold your gaze for 20 seconds',
      'Blink rapidly 10 times',
      'Close your eyes and relax for 10 seconds'
    ],
    benefits: ['Reduces eye strain', 'Prevents headaches', 'Protects vision']
  },
  {
    id: 6,
    type: 'movement',
    title: 'Desk Movement Break',
    duration: 3,
    instructions: [
      'Stand up from your desk',
      'March in place for 30 seconds',
      'Do 10 gentle squats',
      'Twist your torso left and right 5 times each',
      'Jump jacks or spot running for 30 seconds'
    ],
    benefits: ['Increases energy', 'Boosts metabolism', 'Improves focus']
  },
  {
    id: 7,
    type: 'gratitude',
    title: 'Gratitude Moment',
    duration: 2,
    instructions: [
      'Take a comfortable seated position',
      'Think of 3 things you are grateful for today',
      'Smile as you think about each one',
      'Take a deep breath and feel the gratitude',
      'Carry this positive energy into your next task'
    ],
    benefits: ['Boosts mood', 'Increases positivity', 'Reduces stress']
  },
  {
    id: 8,
    type: 'walking',
    title: 'Quick Walk Break',
    duration: 5,
    instructions: [
      'Put on your shoes or walk barefoot if safe',
      'Walk at a comfortable pace',
      'Notice the sights and sounds around you',
      'Swing your arms naturally',
      'Return feeling refreshed and energized'
    ],
    benefits: ['Clears mind', 'Improves creativity', 'Boosts energy']
  }
];

// Get break suggestions
router.get('/', auth, async (req, res) => {
  try {
    const { type, duration } = req.query;
    let suggestions = [...breakSuggestions];

    if (type) {
      suggestions = suggestions.filter(s => s.type === type);
    }

    if (duration) {
      suggestions = suggestions.filter(s => s.duration <= parseInt(duration));
    }

    // Shuffle for variety
    suggestions = suggestions.sort(() => Math.random() - 0.5);

    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get random break suggestion
router.get('/random', auth, async (req, res) => {
  try {
    const randomIndex = Math.floor(Math.random() * breakSuggestions.length);
    res.json(breakSuggestions[randomIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get break by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const suggestions = breakSuggestions.filter(s => s.type === type);
    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a break (track completion)
router.post('/complete', auth, async (req, res) => {
  try {
    const { breakId, duration } = req.body;
    
    // Award points for completing a mindful break
    const pointsEarned = Math.max(5, duration * 2);
    
    // In a real app, you'd track this in a database
    res.json({
      message: 'Break completed successfully!',
      pointsEarned,
      breakId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
