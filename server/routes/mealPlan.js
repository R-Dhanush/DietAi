const express = require('express');
const auth = require('../middleware/auth');
const { generateMealPlan } = require('../services/mealPlanService');
const MealPlan = require('../models/MealPlan'); // Add this import
const router = express.Router();

// Generate new meal plan
router.post('/generate', auth, async (req, res) => {
  try {
    const mealPlan = await generateMealPlan(req.userId);
    res.json(mealPlan);
  } catch (error) {
    if (error.message.includes('No backup API key available')) {
      return res.status(429).json({ 
        success: false,
        message: 'All API quotas exceeded. Please try again later.'
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Get current meal plan
router.get('/current', auth, async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({ userId: req.userId })
      .sort({ createdAt: -1 }) // Get most recent
      .limit(1);
    
    if (!mealPlan) {
      return res.json({ days: [] });
    }
    
    res.json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;