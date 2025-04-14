const express = require('express');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const validateDailyLog = (req, res, next) => {
  if (req.body.meals && !Array.isArray(req.body.meals)) {
    return res.status(400).json({ message: 'Meals must be an array if provided' });
  }
  
  if (!req.body.weight || isNaN(req.body.weight)) {
    return res.status(400).json({ message: 'Valid weight is required' });
  }

  if (!req.body.waterIntake || isNaN(req.body.waterIntake.amount)) {
    return res.status(400).json({ message: 'Valid water intake is required' });
  }

  next();
};

router.post('/', auth, validateDailyLog, async (req, res) => {
  try {
    const { meals = [], waterIntake, weight } = req.body;
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for existing log for this user today
    const existingLog = await DailyLog.findOne({
      userId,
      date: { $gte: today }
    });

    if (existingLog && existingLog.completed) {
      return res.status(400).json({
        success: false,
        message: 'Daily log already submitted for today'
      });
    }

    // Get user's water target
    const user = await User.findById(userId);
    const waterTarget = waterIntake?.target || user.dailyWaterTarget || 2000;

    // Process meals
    const processedMeals = meals.map(meal => ({
      mealId: meal.mealId?.toString() || '',
      status: meal.status || 'pending',
      nutrition: meal.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    }));

    // Calculate total nutrition
    const totalNutrition = processedMeals
      .filter(meal => meal.status === 'eaten')
      .reduce((totals, meal) => ({
        calories: totals.calories + (meal.nutrition?.calories || 0),
        protein: totals.protein + (meal.nutrition?.protein || 0),
        carbs: totals.carbs + (meal.nutrition?.carbs || 0),
        fat: totals.fat + (meal.nutrition?.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Create or update log
    const dailyLog = await DailyLog.findOneAndUpdate(
      { userId, date: { $gte: today } },
      {
        userId,
        meals: processedMeals,
        waterIntake: {
          amount: waterIntake.amount,
          target: waterTarget
        },
        weight,
        totalNutrition,
        completed: true,
        date: today // Explicitly set the date
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Update user's current weight and add log to dailyLogs array
    await User.findByIdAndUpdate(userId, {
      $set: { 'profile.currentWeight': weight },
      $addToSet: { dailyLogs: dailyLog._id } // Add log to user's dailyLogs array
    });

    // Update streak
    await updateStreak(userId);

    res.status(201).json({
      success: true,
      message: 'Daily log submitted successfully',
      log: dailyLog
    });

  } catch (error) {
    console.error('Error submitting daily log:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/check-today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const log = await DailyLog.findOne({
      userId: req.userId,
      date: { $gte: today }
    });
    
    res.json({
      exists: !!log,
      completed: log?.completed || false
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking log' });
  }
});

router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyLog = await DailyLog.findOne({
      userId: req.userId,
      date: { $gte: today }
    }).lean();
    
    if (!dailyLog) {
      return res.json({
        date: today,
        meals: [],
        waterIntake: { amount: 0, target: 0 },
        weight: null,
        totalNutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        completed: false
      });
    }
    
    res.json(dailyLog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily log' });
  }
});

// New endpoint to get progress data
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'dailyLogs',
        match: { completed: true },
        options: { 
          sort: { date: -1 },
          limit: 7 // Get last 7 days
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const formatDate = (date) => new Date(date).toISOString().split('T')[0];

    const progressData = {
      weightHistory: user.dailyLogs
        .filter(log => log.weight !== undefined)
        .map(log => ({
          date: formatDate(log.date),
          value: log.weight
        })),
      waterHistory: user.dailyLogs
        .filter(log => log.waterIntake?.amount !== undefined)
        .map(log => ({
          date: formatDate(log.date),
          value: log.waterIntake.amount
        })),
      calorieHistory: user.dailyLogs
        .filter(log => log.totalNutrition?.calories !== undefined)
        .map(log => ({
          date: formatDate(log.date),
          value: log.totalNutrition.calories
        })),
      calorieTarget: user.profile?.dailyCalories || 2000,
      waterTarget: user.dailyWaterTarget || 2000
    };

    res.json(progressData);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

async function updateStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Initialize streak if not exists
  if (!user.streak) {
    user.streak = {
      current: 1,
      longest: 1,
      lastLogged: today
    };
  } else {
    // Check if logged yesterday
    if (user.streak.lastLogged && 
        new Date(user.streak.lastLogged).setHours(0,0,0,0) === yesterday.getTime()) {
      user.streak.current += 1;
    } else if (new Date(user.streak.lastLogged).setHours(0,0,0,0) !== today.getTime()) {
      // Only reset if not already logged today
      user.streak.current = 1;
    }

    // Update longest streak
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }

    user.streak.lastLogged = today;
  }

  await user.save();
}

module.exports = router;