const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
const { calculateWaterRequirement } = require('../utils/waterCalculator');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    console.log("Fetching profile for user:", req.userId);
    const user = await User.findById(req.userId)
      .select('-password')
      .lean();
    
    if (!user) {
      console.log("User not found"); // Debug log
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log("User profile found:", user);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile || null
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
});

// Update profile
router.put('/', auth, async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      dietaryPreferences = [],
      allergies = [],
      dislikes = [],
      targetWeight,
      targetBodyFat
    } = req.body;

    // Validate required fields
    const requiredFields = ['age', 'gender', 'height', 'weight', 'activityLevel', 'goal', 'targetWeight', 'targetBodyFat'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate data types
    if (isNaN(age) || isNaN(height) || isNaN(weight) || 
        isNaN(targetWeight) || isNaN(targetBodyFat)) {
      return res.status(400).json({
        success: false,
        message: 'Numerical fields must contain valid numbers'
      });
    }

    // Calculate derived values
    const numericValues = {
      age: parseInt(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      targetWeight: parseFloat(targetWeight),
      targetBodyFat: parseFloat(targetBodyFat)
    };

    // Calculate time frame
    const weightDiff = numericValues.weight - numericValues.targetWeight;
    const timeFrame = goal === 'lose' ? Math.max(4, Math.ceil(weightDiff / 0.5)) :
                    goal === 'gain' ? Math.max(4, Math.ceil(-weightDiff / 0.25)) : 0;

    // Calculate TDEE and macros
    const bmr = gender === 'male' ?
      10 * numericValues.weight + 6.25 * numericValues.height - 5 * numericValues.age + 5 :
      10 * numericValues.weight + 6.25 * numericValues.height - 5 * numericValues.age - 161;

    const activityMultipliers = {
      sedentary: 1.2,
      moderate: 1.55,
      active: 1.9
    };

    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
    const adjustedTdee = goal === 'lose' ? tdee - 500 : 
                        goal === 'gain' ? tdee + 500 : tdee;

    const macros = {
      protein: Math.round((adjustedTdee * 0.3) / 4),
      fats: Math.round((adjustedTdee * 0.3) / 9),
      carbs: Math.round((adjustedTdee * 0.4) / 4)
    };

    // Calculate water target
    const dailyWaterTarget = calculateWaterRequirement({
      weight: numericValues.weight,
      activityLevel
    });
    
    // Build profile update
    const profileUpdate = {
      ...numericValues,
      gender,
      activityLevel,
      goal,
      dietaryPreferences: Array.isArray(dietaryPreferences) ? 
        dietaryPreferences : [],
      allergies: Array.isArray(allergies) ? 
        allergies : typeof allergies === 'string' ? 
        allergies.split(',').map(i => i.trim()).filter(i => i) : [],
      dislikes: Array.isArray(dislikes) ? 
        dislikes : typeof dislikes === 'string' ? 
        dislikes.split(',').map(i => i.trim()).filter(i => i) : [],
      targetWeight: numericValues.targetWeight,
      targetBodyFat: numericValues.targetBodyFat,
      timeFrame,
      initialWeight: numericValues.weight,
      currentWeight: numericValues.weight,
      dailyCalories: adjustedTdee,
      dailyMacros: macros,
      lastUpdated: new Date()
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { 
        profile: profileUpdate,
        dailyWaterTarget 
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      profile: updatedUser.profile,
      dailyWaterTarget: updatedUser.dailyWaterTarget
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' ? 
        'Validation failed: ' + error.message :
        'Server error'
    });
  }
});

router.get('/user-info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      streak: user.streak || { current: 0, longest: 0 },
      dailyWaterTarget: user.dailyWaterTarget
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update-weight', auth, async (req, res) => {
  try {
    const { currentWeight } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 'profile.currentWeight': currentWeight },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      currentWeight: user.profile.currentWeight
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating weight' });
  }
});

module.exports = router;