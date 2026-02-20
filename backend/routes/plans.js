const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WellnessPlan = require('../models/WellnessPlan');
const User = require('../models/User');
const { generateWellnessPlan } = require('../utils/aiPlan');

// Helper function to validate and fix array fields
function validateAndFixPlanData(planData) {
  const fixedData = { ...planData };
  
  // Debug: Log the incoming data types
  console.log('=== Validating Plan Data ===');
  console.log('meditation type:', typeof fixedData.meditation, Array.isArray(fixedData.meditation));
  console.log('diet type:', typeof fixedData.diet, Array.isArray(fixedData.diet));
  console.log('workout type:', typeof fixedData.workout, Array.isArray(fixedData.workout));
  
  // Helper to parse stringified arrays back to objects
  const parseArrayField = (field, fieldName = 'unknown') => {
    if (field === undefined || field === null) {
      return field;
    }
    
    // If it's already an array, return as-is
    if (Array.isArray(field)) {
      console.log(`${fieldName}: Already an array with ${field.length} items`);
      // Check if items are objects or strings
      if (field.length > 0) {
        console.log(`${fieldName}: First item type:`, typeof field[0]);
      }
      return field;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof field === 'string') {
      console.log(`${fieldName}: Processing string field, length: ${field.length}`);
      console.log(`${fieldName}: String preview:`, field.substring(0, 100));
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
          console.log(`${fieldName}: Successfully parsed as JSON array`);
          return parsed;
        }
        // If it's an object with array properties, extract them
        if (typeof parsed === 'object' && parsed !== null) {
          console.log(`${fieldName}: Parsed as object, looking for array properties`);
          // Check if this is a nested object with array values
          const arrayValue = Object.values(parsed).find(v => Array.isArray(v));
          if (arrayValue) {
            console.log(`${fieldName}: Extracted array from object`);
            return arrayValue;
          }
        }
      } catch (e) {
        console.log(`${fieldName}: JSON parse failed, trying eval:`, e.message);
        // Try a more permissive parse - replace single quotes with double quotes
        try {
          // Replace single quotes with double quotes (but not within strings)
          const normalized = field.replace(/'/g, '"');
          const parsed = JSON.parse(normalized);
          if (Array.isArray(parsed)) {
            console.log(`${fieldName}: Successfully parsed after normalization`);
            return parsed;
          }
        } catch (e2) {
          console.log(`${fieldName}: Normalized parse also failed`);
        }
      }
    }
    
    // If it's neither string nor array, log warning and return empty array
    console.log(`${fieldName}: Unexpected type, returning empty array`);
    return [];
  };
  
  // Fix meditation array - ensure it's a proper array of objects
  if (fixedData.meditation !== undefined) {
    console.log('Processing meditation field...');
    
    // First, ensure it's an array
    let meditationArray = fixedData.meditation;
    
    // If it's a string, try to parse it
    if (typeof meditationArray === 'string') {
      console.log('meditation is a string, parsing...');
      try {
        meditationArray = JSON.parse(meditationArray);
      } catch (e) {
        // Try replacing single quotes with double quotes
        try {
          meditationArray = JSON.parse(meditationArray.replace(/'/g, '"'));
        } catch (e2) {
          console.log('Failed to parse meditation string');
          meditationArray = [];
        }
      }
    }
    
    // If it's still not an array, make it an array
    if (!Array.isArray(meditationArray)) {
      console.log('meditation is not an array, creating default');
      meditationArray = [];
    }
    
    // Now ensure each item is a proper object with the required properties
    fixedData.meditation = meditationArray.map((item, index) => {
      console.log(`meditation[${index}]:`, typeof item, item);
      
      // If item is a string, convert to object
      if (typeof item === 'string') {
        return {
          day: 'Monday',
          name: item || 'Meditation',
          duration: 10,
          type: 'mindfulness',
          instructions: 'Practice mindfulness'
        };
      }
      
      // If item is an object, ensure it has required properties
      if (typeof item === 'object' && item !== null) {
        return {
          day: item.day || 'Monday',
          name: item.name || 'Meditation',
          duration: typeof item.duration === 'number' ? item.duration : 10,
          type: item.type || 'mindfulness',
          instructions: item.instructions || 'Practice mindfulness'
        };
      }
      
      // If item is neither string nor object, return default
      return {
        day: 'Monday',
        name: 'Meditation',
        duration: 10,
        type: 'mindfulness',
        instructions: 'Practice mindfulness'
      };
    });
    
    console.log('meditation after processing:', fixedData.meditation);
  }
  
  // Fix diet array - ensure it's a proper array of objects
  if (fixedData.diet !== undefined) {
    console.log('Processing diet field...');
    
    let dietArray = fixedData.diet;
    
    if (typeof dietArray === 'string') {
      console.log('diet is a string, parsing...');
      try {
        dietArray = JSON.parse(dietArray);
      } catch (e) {
        try {
          dietArray = JSON.parse(dietArray.replace(/'/g, '"'));
        } catch (e2) {
          console.log('Failed to parse diet string');
          dietArray = [];
        }
      }
    }
    
    if (!Array.isArray(dietArray)) {
      console.log('diet is not an array, creating default');
      dietArray = [];
    }
    
    fixedData.diet = dietArray;
    console.log('diet after processing:', fixedData.diet);
  }
  
  // Fix workout array - ensure it's a proper array of objects
  if (fixedData.workout !== undefined) {
    console.log('Processing workout field...');
    
    let workoutArray = fixedData.workout;
    
    if (typeof workoutArray === 'string') {
      console.log('workout is a string, parsing...');
      try {
        workoutArray = JSON.parse(workoutArray);
      } catch (e) {
        try {
          workoutArray = JSON.parse(workoutArray.replace(/'/g, '"'));
        } catch (e2) {
          console.log('Failed to parse workout string');
          workoutArray = [];
        }
      }
    }
    
    if (!Array.isArray(workoutArray)) {
      console.log('workout is not an array, creating default');
      workoutArray = [];
    }
    
    // Ensure all 7 days are present in workout
    const requiredWorkoutDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const existingWorkoutDays = workoutArray.map(w => w.day);
    
    requiredWorkoutDays.forEach(requiredDay => {
      if (!existingWorkoutDays.includes(requiredDay)) {
        console.log(`Adding missing workout day: ${requiredDay}`);
        workoutArray.push({
          day: requiredDay,
          focus: 'Rest',
          exercises: [],
          duration: 0
        });
      }
    });
    
    // Sort by day order
    const dayOrder = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };
    workoutArray.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
    
    fixedData.workout = workoutArray;
    console.log('workout after processing:', fixedData.workout);
  }
  
  // Fix diet array - ensure all 7 days are present
  if (fixedData.diet !== undefined) {
    console.log('Processing diet field for missing days...');
    
    let dietArray = fixedData.diet;
    
    if (typeof dietArray === 'string') {
      try {
        dietArray = JSON.parse(dietArray);
      } catch (e) {
        try {
          dietArray = JSON.parse(dietArray.replace(/'/g, '"'));
        } catch (e2) {
          dietArray = [];
        }
      }
    }
    
    if (!Array.isArray(dietArray)) {
      dietArray = [];
    }
    
    // Ensure all 7 days are present in diet
    const requiredDietDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const existingDietDays = dietArray.map(d => d.day);
    
    requiredDietDays.forEach(requiredDay => {
      if (!existingDietDays.includes(requiredDay)) {
        console.log(`Adding missing diet day: ${requiredDay}`);
        dietArray.push({
          day: requiredDay,
          meals: [],
          totalCalories: 1500,
          waterIntake: 8
        });
      }
    });
    
    // Sort by day order
    const dayOrder = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };
    dietArray.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
    
    fixedData.diet = dietArray;
    console.log('diet after processing:', fixedData.diet);
  }
  
  console.log('=== Validation Complete ===');
  return fixedData;
}

// Get all plans for user
router.get('/', auth, async (req, res) => {
  try {
    const plans = await WellnessPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active plan
router.get('/active', auth, async (req, res) => {
  try {
    const plan = await WellnessPlan.findOne({ 
      userId: req.user._id,
      isActive: true 
    });
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new AI wellness plan
router.post('/generate', auth, async (req, res) => {
  try {
    const { goals, fitnessLevel } = req.body;
    
    console.log('Generate plan request:', { goals, fitnessLevel, userId: req.user._id });
    
    if (!goals || !goals.length) {
      return res.status(400).json({ message: 'Goals are required' });
    }

    // Generate AI plan using OpenAI
    console.log('Generating AI plan...');
    const planData = await generateWellnessPlan(goals, fitnessLevel || req.user.fitnessLevel);
    console.log('AI plan generated successfully');
    
    // Deactivate previous plans  
    console.log('Deactivating previous plans...');
    await WellnessPlan.updateMany(
      { userId: req.user._id, isActive: true },
      { isActive: false }
    );

    // Validate and fix any stringified array fields
    const fixedPlanData = validateAndFixPlanData(planData);

    // Create new plan
    console.log('Creating new plan with data:', JSON.stringify(fixedPlanData, null, 2));
    const plan = new WellnessPlan({
      userId: req.user._id,
      goals: goals,
      ...fixedPlanData
    });

    await plan.save();
    console.log('Plan saved successfully');

    // Update user goals
    await User.findByIdAndUpdate(req.user._id, { goals });

    // Award points
    const leveledUp = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { points: 50 } },
      { new: true }
    );

    res.status(201).json({
      plan,
      leveledUp: leveledUp.level > req.user.level,
      newLevel: leveledUp.level
    });
  } catch (error) {
    console.error('Error generating plan:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get specific plan
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await WellnessPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update plan
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await WellnessPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await WellnessPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
