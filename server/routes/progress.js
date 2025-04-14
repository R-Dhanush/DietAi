const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get progress data
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'dailyLogs',
        options: { 
          sort: { date: -1 },
          limit: 7
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

module.exports = router;