const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * AI-Powered Wellness Plan Generator
 * 
 * This generates personalized wellness plans using OpenAI API based on user goals and fitness level.
 * 
 * @param {string[]} goals - User's selected goals
 * @param {string} fitnessLevel - User's fitness level (beginner, intermediate, advanced)
 * @returns {Object} - Complete wellness plan
 */

async function generateWellnessPlan(goals, fitnessLevel = 'beginner') {
  const goalsStr = goals.join(', ');
  
  const prompt = `Generate a personalized 7-day wellness plan for someone with fitness level "${fitnessLevel}" and goals: ${goalsStr}. 
  
  IMPORTANT: Return the response STRICTLY as valid JSON array of objects - do not wrap in code blocks, do not add any text before or after the JSON.
  
  Return a JSON object with exactly this structure:
  {
    "diet": [
      {
        "day": "Monday",
        "meals": [
          {"name": "Breakfast", "foods": ["meal description"], "calories": number, "protein": "Xg", "carbs": "Xg", "fat": "Xg"},
          {"name": "Lunch", "foods": ["meal description"], "calories": number, "protein": "Xg", "carbs": "Xg", "fat": "Xg"},
          {"name": "Dinner", "foods": ["meal description"], "calories": number, "protein": "Xg", "carbs": "Xg", "fat": "Xg"}
        ],
        "totalCalories": number,
        "waterIntake": number
      }
    ],
    "workout": [
      {
        "day": "Monday",
        "focus": "workout focus area",
        "exercises": [
          {"name": "exercise name", "duration": "string", "reps": "string", "sets": "string", "calories": number, "instructions": ["step1", "step2"]}
        ],
        "duration": number
      }
    ],
    "meditation": [
      {
        "day": "Monday",
        "name": "meditation name",
        "duration": number,
        "type": "type of meditation",
        "instructions": "brief instructions"
      }
    ],
    "sleepSchedule": {
      "bedtime": "HH:MM",
      "wakeTime": "HH:MM",
      "duration": number
    }
  }

  Make sure the calorie targets are appropriate for the fitness level:
  - beginner: 1500-1800 calories
  - intermediate: 1800-2200 calories
  - advanced: 2200-2800 calories

  CRITICAL: Return ONLY valid JSON, no markdown code blocks, no explanations, no text before or after the JSON. Start your response with { and end with }`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a wellness expert and nutritionist. Generate personalized wellness plans in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const responseText = completion.choices[0].message.content;
    
    // Log the raw response for debugging
    console.log('=== AI Response (raw) ===');
    console.log(responseText.substring(0, 500));
    console.log('=== End AI Response ===');
    
    // Parse the JSON response
    let cleanedResponse = responseText
      .replace(/'\s*\+\s*'/g, '')   // remove string concatenation
      .replace(/\n/g, '');          // remove newlines
    let plan = JSON.parse(cleanedResponse);
    
    // Log the parsed plan structure for debugging
    console.log('=== Parsed Plan Structure ===');
    console.log('diet type:', Array.isArray(plan.diet) ? 'array' : typeof plan.diet);
    console.log('workout type:', Array.isArray(plan.workout) ? 'array' : typeof plan.workout);
    console.log('meditation type:', Array.isArray(plan.meditation) ? 'array' : typeof plan.meditation);
    if (Array.isArray(plan.meditation) && plan.meditation.length > 0) {
      console.log('meditation[0] type:', typeof plan.meditation[0]);
    }
    console.log('=== End Plan Structure ===');
    
    return plan;
  } catch (error) {
    console.error('Error generating wellness plan with OpenAI:', error);
    // Fallback to mock implementation if API call fails
    return generateMockWellnessPlan(goals, fitnessLevel);
  }
}

// Fallback mock implementation
function generateMockWellnessPlan(goals, fitnessLevel = 'beginner') {
  const plan = {
    diet: generateDietPlan(goals, fitnessLevel),
    workout: generateWorkoutPlan(goals, fitnessLevel),
    meditation: generateMeditationPlan(goals),
    sleepSchedule: generateSleepSchedule(goals)
  };

  return plan;
}

// Helper function to normalize goal strings for matching
function normalizeGoal(goal) {
  return goal.toLowerCase().replace(/[\s_-]+/g, '_');
}

// Helper function to check if goals contain a specific goal (case-insensitive)
function goalsContain(goals, targetGoal) {
  const normalizedTarget = normalizeGoal(targetGoal);
  return goals.some(goal => normalizeGoal(goal) === normalizedTarget);
}

function generateDietPlan(goals, fitnessLevel) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const calorieTargets = {
    beginner: { min: 1500, max: 1800 },
    intermediate: { min: 1800, max: 2200 },
    advanced: { min: 2200, max: 2800 }
  };

  const targets = calorieTargets[fitnessLevel] || calorieTargets.beginner;
  const avgCalories = Math.round((targets.min + targets.max) / 2);

  const mealPlans = {
    weight_loss: {
      breakfast: 'Oatmeal with berries and honey',
      lunch: 'Grilled chicken salad with quinoa',
      dinner: 'Baked salmon with steamed vegetables',
      snacks: ['Apple with almonds', 'Greek yogurt']
    },
    stress_relief: {
      breakfast: 'Avocado toast with eggs',
      lunch: 'Turkey and veggie wrap',
      dinner: 'Warm soup with whole grain bread',
      snacks: ['Dark chocolate', 'Banana smoothie']
    },
    fitness: {
      breakfast: 'Protein pancakes with fruit',
      lunch: 'Lean beef with rice and broccoli',
      dinner: 'Chicken breast with sweet potato',
      snacks: ['Protein shake', 'Nut butter toast']
    },
    better_sleep: {
      breakfast: 'Banana oat smoothie',
      lunch: 'Mediterranean salad',
      dinner: 'Light turkey with vegetables',
      snacks: ['Warm milk', 'Almonds']
    },
    mental_clarity: {
      breakfast: 'Blueberry smoothie with flax seeds',
      lunch: 'Quinoa bowl with vegetables',
      dinner: 'Grilled fish with leafy greens',
      snacks: ['Green tea', 'Walnuts']
    },
    healthy_eating: {
      breakfast: 'Fresh fruit with yogurt',
      lunch: 'Mixed greens with grilled protein',
      dinner: 'Roasted vegetables with lean meat',
      snacks: ['Vegetable sticks', 'Hummus']
    }
  };

  const defaultMeals = mealPlans.healthy_eating;

  return days.map(day => {
    let meals = [];
    
    // Use case-insensitive goal matching
    if (goalsContain(goals, 'weight_loss')) {
      meals = [mealPlans.weight_loss.breakfast, mealPlans.weight_loss.lunch, mealPlans.weight_loss.dinner];
    } else if (goalsContain(goals, 'stress_relief')) {
      meals = [mealPlans.stress_relief.breakfast, mealPlans.stress_relief.lunch, mealPlans.stress_relief.dinner];
    } else if (goalsContain(goals, 'fitness')) {
      meals = [mealPlans.fitness.breakfast, mealPlans.fitness.lunch, mealPlans.fitness.dinner];
    } else if (goalsContain(goals, 'better_sleep')) {
      meals = [mealPlans.better_sleep.breakfast, mealPlans.better_sleep.lunch, mealPlans.better_sleep.dinner];
    } else if (goalsContain(goals, 'mental_clarity')) {
      meals = [mealPlans.mental_clarity.breakfast, mealPlans.mental_clarity.lunch, mealPlans.mental_clarity.dinner];
    } else {
      meals = [defaultMeals.breakfast, defaultMeals.lunch, defaultMeals.dinner];
    }

    return {
      day,
      meals: meals.map((food, index) => ({
        name: ['Breakfast', 'Lunch', 'Dinner'][index],
        foods: [food],
        calories: Math.round(avgCalories / 3),
        protein: `${Math.round(avgCalories * 0.3 / 4)}g`,
        carbs: `${Math.round(avgCalories * 0.4 / 4)}g`,
        fat: `${Math.round(avgCalories * 0.3 / 9)}g`
      })),
      totalCalories: avgCalories,
      waterIntake: 8
    };
  });
}

function generateWorkoutPlan(goals, fitnessLevel) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const workoutTypes = {
    beginner: [
      { 
        focus: 'Full Body', 
        exercises: [
          { name: 'Bodyweight squats', duration: '20 mins', reps: '15', sets: '3', calories: 100, instructions: ['Stand with feet shoulder-width apart', 'Lower your body as if sitting back into a chair', 'Keep your chest up and knees over toes', 'Return to standing position'] },
          { name: 'Push-ups', duration: '15 mins', reps: '10', sets: '3', calories: 80, instructions: ['Start in plank position', 'Lower your chest to the ground', 'Push back up to starting position'] },
          { name: 'Lunges', duration: '15 mins', reps: '12 each leg', sets: '3', calories: 90, instructions: ['Step forward with one leg', 'Lower your hips until both knees are bent', 'Push back to starting position'] },
          { name: 'Plank', duration: '10 mins', reps: '30 sec', sets: '3', calories: 50, instructions: ['Hold push-up position with arms straight', 'Keep body in straight line', 'Engage your core'] },
          { name: 'Jumping jacks', duration: '10 mins', reps: '20', sets: '3', calories: 70, instructions: ['Jump while spreading legs and raising arms', 'Return to starting position'] }
        ] 
      },
      { focus: 'Rest', exercises: [] },
      { 
        focus: 'Cardio', 
        exercises: [
          { name: 'Jogging', duration: '20 mins', reps: '-', sets: '1', calories: 150, instructions: ['Jog at a steady pace', 'Keep your arms relaxed'] },
          { name: 'Jump rope', duration: '10 mins', reps: '100', sets: '3', calories: 100, instructions: ['Jump rope at moderate pace', 'Land softly on balls of feet'] },
          { name: 'Burpees', duration: '10 mins', reps: '10', sets: '3', calories: 80, instructions: ['Start standing', 'Drop into squat, kick feet back', 'Do a push-up', 'Jump feet forward and jump up'] }
        ] 
      },
      { 
        focus: 'Upper Body', 
        exercises: [
          { name: 'Push-ups', duration: '15 mins', reps: '12', sets: '3', calories: 80, instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up'] },
          { name: 'Tricep dips', duration: '10 mins', reps: '12', sets: '3', calories: 60, instructions: ['Use a chair or bench', 'Lower body by bending elbows', 'Push back up'] },
          { name: 'Arm circles', duration: '5 mins', reps: '20 each direction', sets: '2', calories: 30, instructions: ['Extend arms to sides', 'Make small circles', 'Increase circle size'] },
          { name: 'Superman hold', duration: '5 mins', reps: '30 sec', sets: '3', calories: 40, instructions: ['Lie face down', 'Raise arms and legs', 'Hold and squeeze glutes'] }
        ] 
      },
      { 
        focus: 'Lower Body', 
        exercises: [
          { name: 'Squats', duration: '15 mins', reps: '15', sets: '3', calories: 100, instructions: ['Stand with feet shoulder-width', 'Lower body as if sitting', 'Keep weight in heels'] },
          { name: 'Lunges', duration: '15 mins', reps: '12 each leg', sets: '3', calories: 90, instructions: ['Step forward', 'Lower hips', 'Push back'] },
          { name: 'Calf raises', duration: '10 mins', reps: '20', sets: '3', calories: 50, instructions: ['Stand on edge of step', 'Rise onto toes', 'Lower slowly'] },
          { name: 'Glute bridges', duration: '10 mins', reps: '15', sets: '3', calories: 60, instructions: ['Lie on back, knees bent', 'Lift hips toward ceiling', 'Squeeze glutes at top'] }
        ] 
      },
      { focus: 'Active Recovery', exercises: [] },
      { 
        focus: 'Fun Activity', 
        exercises: [
          { name: 'Swimming', duration: '30 mins', reps: '-', sets: '1', calories: 200, instructions: ['Swim at moderate pace', 'Use different strokes'] },
          { name: 'Cycling', duration: '30 mins', reps: '-', sets: '1', calories: 180, instructions: ['Bike at steady pace', 'Use varied terrain if possible'] },
          { name: 'Dancing', duration: '20 mins', reps: '-', sets: '1', calories: 150, instructions: ['Dance to favorite music', 'Keep moving'] }
        ] 
      }
    ],
    intermediate: [
      { 
        focus: 'Strength Training', 
        exercises: [
          { name: 'Weighted squats', duration: '25 mins', reps: '12', sets: '4', calories: 150, instructions: ['Use dumbbells or barbell', 'Squat to parallel or below', 'Keep core tight'] },
          { name: 'Push-ups with variation', duration: '15 mins', reps: '12', sets: '4', calories: 100, instructions: ['Try wide, narrow, or diamond grip', 'Lower with control'] },
          { name: 'Dumbbell rows', duration: '15 mins', reps: '12', sets: '3', calories: 90, instructions: ['Bend at hips', 'Pull dumbbell to chest', 'Squeeze shoulder blade'] },
          { name: 'Plank variations', duration: '10 mins', reps: '45 sec', sets: '3', calories: 60, instructions: ['Try side planks', 'Add leg lifts for challenge'] },
          { name: 'Mountain climbers', duration: '10 mins', reps: '20', sets: '3', calories: 120, instructions: ['Start in plank', 'Drive knees to chest', 'Alternate quickly'] }
        ] 
      },
      { 
        focus: 'HIIT', 
        exercises: [
          { name: 'Burpees', duration: '5 mins', reps: '15', sets: '4', calories: 100, instructions: ['Full body movement', 'Explosive jumps'] },
          { name: 'Jump squats', duration: '5 mins', reps: '15', sets: '4', calories: 90, instructions: ['Squat down and explode up', 'Land softly'] },
          { name: 'High knees', duration: '5 mins', reps: '30 sec', sets: '4', calories: 80, instructions: ['Run in place', 'Drive knees high'] },
          { name: 'Box jumps', duration: '5 mins', reps: '12', sets: '3', calories: 100, instructions: ['Use sturdy box', 'Jump onto box', 'Step down'] },
          { name: 'Sprint intervals', duration: '10 mins', reps: '30 sec on, 30 sec off', sets: '6', calories: 150, instructions: ['Sprint all out', 'Walk to recover'] }
        ] 
      },
      { 
        focus: 'Cardio', 
        exercises: [
          { name: 'Running', duration: '30 mins', reps: '-', sets: '1', calories: 250, instructions: ['Maintain steady pace', 'Use varied terrain'] },
          { name: 'Cycling', duration: '30 mins', reps: '-', sets: '1', calories: 220, instructions: ['Use resistance', 'Maintain cadence'] },
          { name: 'Rowing', duration: '20 mins', reps: '-', sets: '1', calories: 200, instructions: ['Use full stroke', 'Maintain power'] }
        ] 
      },
      { 
        focus: 'Upper Body', 
        exercises: [
          { name: 'Pull-ups', duration: '15 mins', reps: '8', sets: '4', calories: 100, instructions: ['Hang from bar', 'Pull up to chin', 'Lower with control'] },
          { name: 'Dumbbell press', duration: '15 mins', reps: '12', sets: '4', calories: 90, instructions: ['Press dumbbells up', 'Lower with control'] },
          { name: 'Shoulder press', duration: '15 mins', reps: '12', sets: '3', calories: 80, instructions: ['Press overhead', 'Keep core engaged'] },
          { name: 'Bicep curls', duration: '10 mins', reps: '12', sets: '3', calories: 60, instructions: ['Curl weights up', 'Squeeze at top'] },
          { name: 'Tricep extensions', duration: '10 mins', reps: '12', sets: '3', calories: 60, instructions: ['Extend arms overhead', 'Lower behind head'] }
        ] 
      },
      { 
        focus: 'Lower Body', 
        exercises: [
          { name: 'Deadlifts', duration: '20 mins', reps: '10', sets: '4', calories: 150, instructions: ['Keep back straight', 'Lift with legs', 'Squeeze glutes'] },
          { name: 'Leg press', duration: '15 mins', reps: '12', sets: '4', calories: 120, instructions: ['Press through heels', 'Control the weight'] },
          { name: 'Lunges', duration: '15 mins', reps: '12 each leg', sets: '3', calories: 100, instructions: ['Step forward', 'Lower hips', 'Push back'] },
          { name: 'Leg curls', duration: '15 mins', reps: '12', sets: '3', calories: 80, instructions: ['Curl weight up', 'Control the descent'] },
          { name: 'Calf raises', duration: '10 mins', reps: '20', sets: '4', calories: 50, instructions: ['Rise onto toes', 'Squeeze at top'] }
        ] 
      },
      { focus: 'Active Recovery', exercises: [] },
      { 
        focus: 'Sport/Activity', 
        exercises: [
          { name: 'Tennis', duration: '45 mins', reps: '-', sets: '1', calories: 300, instructions: ['Play singles or doubles', 'Move side to side'] },
          { name: 'Basketball', duration: '45 mins', reps: '-', sets: '1', calories: 350, instructions: ['Play half court or full', 'Include shooting and dribbling'] },
          { name: 'Rock climbing', duration: '45 mins', reps: '-', sets: '1', calories: 280, instructions: ['Use proper technique', 'Rest between climbs'] }
        ] 
      }
    ],
    advanced: [
      { 
        focus: 'Heavy Lifting', 
        exercises: [
          { name: 'Barbell squats', duration: '30 mins', reps: '8', sets: '5', calories: 200, instructions: ['Use heavy weight', 'Squat to parallel', 'Keep core tight'] },
          { name: 'Bench press', duration: '25 mins', reps: '8', sets: '5', calories: 180, instructions: ['Use barbell', 'Lower to chest', 'Press up'] },
          { name: 'Deadlifts', duration: '25 mins', reps: '8', sets: '5', calories: 220, instructions: ['Keep back flat', 'Lift with legs', 'Stand tall'] },
          { name: 'Overhead press', duration: '20 mins', reps: '8', sets: '4', calories: 150, instructions: ['Press bar overhead', 'Keep core engaged'] },
          { name: 'Barbell rows', duration: '20 mins', reps: '10', sets: '4', calories: 160, instructions: ['Bend over', 'Pull bar to chest', 'Squeeze back'] }
        ] 
      },
      { 
        focus: 'HIIT', 
        exercises: [
          { name: 'Tabata intervals', duration: '20 mins', reps: '20 sec work, 10 sec rest', sets: '8', calories: 200, instructions: ['Maximum effort', '20 on, 10 off'] },
          { name: 'AMRAP', duration: '20 mins', reps: 'As many rounds as possible', sets: '1', calories: 250, instructions: ['Complete exercises in sequence', 'Count total rounds'] },
          { name: 'Challenge circuits', duration: '25 mins', reps: '-', sets: '3', calories: 220, instructions: ['Circuit of 5-6 exercises', 'Minimal rest'] },
          { name: 'Sprint intervals', duration: '15 mins', reps: '1 min on, 1 min off', sets: '8', calories: 180, instructions: ['Maximum effort sprints', 'Active recovery'] },
          { name: 'Battle ropes', duration: '15 mins', reps: '30 sec', sets: '8', calories: 150, instructions: ['Alternating waves', 'Slams', 'Power moves'] }
        ] 
      },
      { 
        focus: 'Cardio', 
        exercises: [
          { name: 'Long distance run', duration: '45 mins', reps: '-', sets: '1', calories: 400, instructions: ['Maintain steady pace', 'Stay hydrated'] },
          { name: 'HIIT cycling', duration: '30 mins', reps: '-', sets: '1', calories: 350, instructions: ['High resistance intervals', 'Sprint bursts'] },
          { name: 'Stair climber', duration: '30 mins', reps: '-', sets: '1', calories: 320, instructions: ['Fast pace', 'Use full range of motion'] }
        ] 
      },
      { 
        focus: 'Upper Body', 
        exercises: [
          { name: 'Weighted pull-ups', duration: '20 mins', reps: '8', sets: '4', calories: 150, instructions: ['Add weight with belt', 'Full range of motion'] },
          { name: 'Dips', duration: '15 mins', reps: '12', sets: '4', calories: 120, instructions: ['Use parallel bars', 'Lower fully'] },
          { name: 'Incline press', duration: '15 mins', reps: '10', sets: '4', calories: 130, instructions: ['Bench at 45 degrees', 'Press up'] },
          { name: 'Lateral raises', duration: '10 mins', reps: '15', sets: '4', calories: 80, instructions: ['Light weights', 'Side raises'] },
          { name: 'Face pulls', duration: '10 mins', reps: '15', sets: '4', calories: 70, instructions: ['Pull to face', 'External rotation'] }
        ] 
      },
      { 
        focus: 'Lower Body', 
        exercises: [
          { name: 'Front squats', duration: '20 mins', reps: '10', sets: '4', calories: 180, instructions: ['Bar in front rack', 'Squat deep'] },
          { name: 'Romanian deadlifts', duration: '20 mins', reps: '12', sets: '4', calories: 170, instructions: ['Hinge at hips', 'Hamstring focus'] },
          { name: 'Leg press', duration: '20 mins', reps: '15', sets: '4', calories: 160, instructions: ['Heavy weight', 'Full range'] },
          { name: 'Bulgarian split squats', duration: '15 mins', reps: '12 each leg', sets: '3', calories: 140, instructions: ['Rear foot elevated', 'Front leg works'] },
          { name: 'Hip thrusts', duration: '15 mins', reps: '12', sets: '4', calories: 130, instructions: ['Back on bench', 'Drive hips up'] }
        ] 
      },
      { focus: 'Active Recovery', exercises: [] },
      { 
        focus: 'Competition/Sport', 
        exercises: [
          { name: 'CrossFit', duration: '60 mins', reps: '-', sets: '1', calories: 500, instructions: ['High intensity', 'Varied exercises'] },
          { name: 'Race', duration: '60 mins', reps: '-', sets: '1', calories: 450, instructions: ['Run at race pace', 'Prepare accordingly'] },
          { name: 'Tournament play', duration: '90 mins', reps: '-', sets: '1', calories: 400, instructions: ['Competitive play', 'Multiple games'] }
        ] 
      }
    ]
  };

  const workouts = workoutTypes[fitnessLevel] || workoutTypes.beginner;

  const durations = {
    beginner: [30, 0, 35, 30, 35, 45, 30],
    intermediate: [45, 30, 45, 45, 50, 45, 60],
    advanced: [60, 45, 60, 60, 65, 45, 90]
  };

  const workoutDurations = durations[fitnessLevel] || durations.beginner;

  return days.map((day, index) => ({
    day,
    focus: workouts[index].focus,
    exercises: workouts[index].exercises,
    duration: workoutDurations[index]
  }));
}

function generateMeditationPlan(goals) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const meditationTypes = {
    stress_relief: [
      { name: 'Body Scan Meditation', duration: 10, type: 'relaxation', instructions: 'Lie down and slowly scan your body from head to toe, releasing tension in each area.' },
      { name: 'Breathing Meditation', duration: 5, type: 'breathing', instructions: 'Focus on your breath, inhaling for 4 counts and exhaling for 6 counts.' },
      { name: 'Loving Kindness', duration: 10, type: 'compassion', instructions: 'Repeat phrases of kindness towards yourself and others.' },
      { name: 'Progressive Relaxation', duration: 10, type: 'relaxation', instructions: 'Tense and release each muscle group systematically.' },
      { name: 'Guided Visualization', duration: 10, type: 'visualization', instructions: 'Imagine a peaceful place and engage all your senses.' },
      { name: 'Silent Meditation', duration: 15, type: 'mindfulness', instructions: 'Sit in silence and observe your thoughts without judgment.' },
      { name: 'Gratitude Meditation', duration: 5, type: 'gratitude', instructions: 'Focus on things you are grateful for.' }
    ],
    default: [
      { name: 'Morning Mindfulness', duration: 5, type: 'mindfulness', instructions: 'Start your day with awareness and intention.' },
      { name: 'Focus Meditation', duration: 10, type: 'concentration', instructions: 'Focus on a single point of attention.' },
      { name: 'Body Awareness', duration: 10, type: 'mindfulness', instructions: 'Notice sensations in your body without judgment.' },
      { name: 'Breath Awareness', duration: 5, type: 'breathing', instructions: 'Follow your natural breath.' },
      { name: 'Evening Wind Down', duration: 10, type: 'relaxation', instructions: 'Release the day\'s stress and prepare for rest.' },
      { name: 'Weekend Deep Dive', duration: 20, type: 'mindfulness', instructions: 'Extended meditation session.' },
      { name: 'Mindful Movement', duration: 10, type: 'movement', instructions: 'Combine gentle movement with awareness.' }
    ]
  };

  // Use case-insensitive goal matching
  const meditations = goalsContain(goals, 'stress_relief') ? meditationTypes.stress_relief : meditationTypes.default;

  return days.map((day, index) => ({
    day,
    ...meditations[index % meditations.length]
  }));
}

function generateSleepSchedule(goals) {
  let bedtime = '22:00';
  let wakeTime = '06:00';

  // Use case-insensitive goal matching
  if (goalsContain(goals, 'fitness')) {
    bedtime = '21:30';
    wakeTime = '06:30';
  } else if (goalsContain(goals, 'stress_relief')) {
    bedtime = '21:00';
    wakeTime = '07:00';
  } else if (goalsContain(goals, 'better_sleep')) {
    bedtime = '21:00';
    wakeTime = '07:00';
  }

  return {
    bedtime,
    wakeTime,
    duration: 8
  };
}

module.exports = {
  generateWellnessPlan
};
