const axios = require('axios');
const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const DailyLog = require('../models/DailyLog');
const apiKeyManager = require('../utils/apiKeyManager');

// Constants
const validDiets = ['vegetarian', 'vegan', 'keto', 'gluten free'];
const MIN_CALORIES = 1200;
const MAX_CALORIES = 4000;
const DEFAULT_CALORIES = 2000;
const API_TIMEOUT = 10000;

// Helper function with improved error handling and caching
const getMealDetails = async (mealId) => {
  try {
    // Check cache first
    const cachedMeal = await MealPlan.findOne({ 'days.meals.id': mealId })
      .select('days.meals.$')
      .lean();
    
    if (cachedMeal?.days?.[0]?.meals?.[0]) {
      return cachedMeal.days[0].meals[0];
    }

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${mealId}/information`, 
      {
        params: {
          apiKey: apiKeyManager.getCurrentKey(),
          includeNutrition: true
        },
        timeout: 5000 // 5 second timeout
      }
    );

    apiKeyManager.updateRemainingRequests(
      parseInt(response.headers['x-api-quota-remaining'] || 150)
    );

    return {
      ...response.data,
      nutrition: response.data.nutrition || {
        nutrients: [
          { name: 'Calories', amount: 0 },
          { name: 'Protein', amount: 0 },
          { name: 'Fat', amount: 0 },
          { name: 'Carbohydrates', amount: 0 }
        ]
      }
    };
  } catch (error) {
    if (error.response?.status === 402 && apiKeyManager.hasBackupKey()) {
      const newKey = apiKeyManager.rotateKey();
      
      try {
        const retryResponse = await axios.get(
          `https://api.spoonacular.com/recipes/${mealId}/information`, 
          {
            params: {
              apiKey: newKey,
              includeNutrition: true
            },
            timeout: 5000
          }
        );
        return retryResponse.data;
      } catch (retryError) {
        console.error(`Retry failed for meal ${mealId}:`, retryError.message);
        return null;
      }
    }
    
    console.error(`Error fetching meal ${mealId}:`, error.message);
    return null;
  }
};

// Validate Spoonacular API parameters
const validateSpoonacularParams = (params) => {
  const errors = [];
  
  if (!params.targetCalories || 
      isNaN(params.targetCalories) || 
      params.targetCalories < MIN_CALORIES || 
      params.targetCalories > MAX_CALORIES) {
    errors.push(`Calories must be a number between ${MIN_CALORIES}-${MAX_CALORIES}`);
  }

  if (params.exclude) {
    if (typeof params.exclude !== 'string') {
      errors.push('Exclude must be a comma-separated string');
    } else if (params.exclude.length > 300) {
      errors.push('Exclusion list too long (max 300 chars)');
    }
  }

  if (params.timeFrame && !['day', 'week'].includes(params.timeFrame)) {
    errors.push('Invalid timeFrame (must be "day" or "week")');
  }

  if (params.diet && !validDiets.includes(params.diet)) {
    errors.push(`Invalid diet specified. Must be one of: ${validDiets.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid parameters: ${errors.join(', ')}`);
  }
};

/**
 * Clean and format user preferences for API request
 */
const formatUserPreferences = (userProfile) => {
  const { 
    dietaryPreferences = [], 
    allergies = [], 
    dislikes = [],
    dailyCalories: profileCalories
  } = userProfile;

  // Process calories
  const targetCalories = Math.floor(
    Number(profileCalories || DEFAULT_CALORIES)
  );
  if (isNaN(targetCalories)) {
    throw new Error('Invalid calories value in profile');
  }

  // Process diet preference
  const userDiet = dietaryPreferences.find(pref => validDiets.includes(pref));

  // Process exclusions
  const exclusions = [...new Set([...allergies, ...dislikes])]
    .filter(item => item?.toString().trim().length > 0)
    .map(item => item.toString().toLowerCase().trim().replace(/\s+/g, '-'));

  return {
    targetCalories,
    userDiet,
    exclusions
  };
};

/**
 * Main meal plan generator
 */
const generateMealPlan = async (userId, dailyCalories = null) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user?.profile) throw new Error('User profile not complete');

    // Format user preferences
    const { targetCalories, userDiet, exclusions } = formatUserPreferences(user.profile);

    // Override with provided calories if specified
    const finalCalories = dailyCalories 
      ? Math.max(MIN_CALORIES, Math.min(MAX_CALORIES, Number(dailyCalories)))
      : targetCalories;

    if (isNaN(finalCalories)) {
      throw new Error('Invalid calories value provided');
    }

    // Build API parameters
    const params = {
      timeFrame: 'week',
      targetCalories: finalCalories,
      apiKey: apiKeyManager.getCurrentKey()
    };

    // Add diet if specified
    if (userDiet) {
      params.diet = userDiet;
    }

    // Add exclusions if any
    if (exclusions.length > 0) {
      params.exclude = exclusions.join(',');
    }

    // Remove undefined/null parameters
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
    );

    // Validate parameters before sending
    validateSpoonacularParams(cleanParams);

    console.log('API Request Params:', { 
      ...cleanParams, 
      apiKey: '***' + cleanParams.apiKey.slice(-3) 
    });

    // Make API request with retry logic
    let planResponse;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      planResponse = await axios.get(
        'https://api.spoonacular.com/mealplanner/generate',
        { 
          params: cleanParams,
          signal: controller.signal,
          timeout: API_TIMEOUT
          // Remove validateStatus - let axios throw on 400 errors
        }
      );
      
      clearTimeout(timeout);
      
      apiKeyManager.updateRemainingRequests(
        parseInt(planResponse.headers['x-api-quota-remaining'] || 150)
      );
    } catch (apiError) {
      clearTimeout(timeout);
      
      if (apiError.response?.status === 402 && apiKeyManager.hasBackupKey()) {
        console.log('API quota exceeded, rotating key...');
        cleanParams.apiKey = apiKeyManager.rotateKey();
        
        // Retry with new key
        planResponse = await axios.get(
          'https://api.spoonacular.com/mealplanner/generate',
          { params: cleanParams }
        );
      } else if (apiError.response?.status === 400) {
        // Handle 400 errors specifically
        console.error('API 400 Error Details:', {
          params: cleanParams,
          response: apiError.response?.data
        });
        throw new Error(`Invalid request: ${apiError.response.data?.message || 'Check your parameters'}`);
      } else {
        throw apiError;
      }
    }

    // Add response validation
    if (!planResponse?.data?.week) {
      throw new Error('Invalid API response structure');
    }

    // Process response
    const today = new Date();
    const days = await Promise.all(
      Object.entries(planResponse.data.week).map(async ([dayName, dayData], index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
    
        // Add defensive checks for dayData.meals
        if (!dayData || !dayData.meals) {
          console.warn(`No meals data for day ${dayName}`);
          return {
            date,
            meals: [],
            nutrients: {}
          };
        }
    
        // Convert meals object to array if needed
        const mealsArray = Array.isArray(dayData.meals) 
          ? dayData.meals 
          : Object.values(dayData.meals);
    
        const meals = await Promise.all(
          mealsArray.map(async meal => {
            if (!meal || !meal.id) {
              console.warn('Invalid meal object:', meal);
              return null;
            }
    
            try {
              const details = await getMealDetails(meal.id);
              if (!details) return null;
    
              return {
                id: meal.id,
                title: meal.title || 'Untitled Meal',
                image: details.image || `https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`,
                readyInMinutes: details.readyInMinutes || 30,
                servings: details.servings || 2,
                nutrition: {
                  calories: details.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
                  protein: details.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
                  fat: details.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
                  carbs: details.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0
                }
              };
            } catch (mealError) {
              console.error(`Error processing meal ${meal.id}:`, mealError.message);
              return null;
            }
          })
        );
    
        return {
          date,
          meals: meals.filter(Boolean),
          nutrients: dayData.nutrients || {}
        };
      })
    );

    // Save meal plan
    const mealPlan = new MealPlan({
      userId,
      startDate: today,
      endDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
      days,
      createdAt: new Date()
    });

    await mealPlan.save();
    return mealPlan;

  } catch (error) {
    console.error('Meal plan generation failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Fallback to cached plan if available
    const lastPlan = await MealPlan.findOne({ userId })
      .sort({ createdAt: -1 });
    if (lastPlan) {
      console.log('Using cached meal plan');
      return lastPlan;
    }

    throw new Error(
      error.response?.status === 402 ? 
      'API quota exceeded. Please try again later.' : 
      'Failed to generate meal plan'
    );
  }
};

/**
 * Generate next week's plan with adjustments based on past week
 */
const generateNextWeekPlan = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error('User not found');

    // Analyze past week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const logs = await DailyLog.find({
      userId,
      date: { $gte: weekAgo },
      completed: true
    }).sort({ date: 1 });

    // Calculate adjustments
    let calorieAdjustment = 0;
    const totalMeals = Math.max(1, logs.reduce((sum, log) => sum + log.meals.length, 0));
    const complianceRate = logs.reduce((sum, log) => 
      sum + log.meals.filter(m => m.status === 'eaten').length, 0) / totalMeals;

    // Weight change adjustment
    if (logs.length >= 3) {
      const weightDiff = logs[0].weight - logs[logs.length - 1].weight;
      
      if (user.profile.goal === 'lose') {
        if (weightDiff < 0.5) calorieAdjustment = -100;
        else if (weightDiff > 1.5) calorieAdjustment = 100;
      } else if (user.profile.goal === 'gain') {
        if (weightDiff < 0.2) calorieAdjustment = 100;
        else if (weightDiff > 0.5) calorieAdjustment = -100;
      }
    }

    // Compliance adjustment
    if (complianceRate < 0.7) calorieAdjustment -= 50;
    else if (complianceRate > 0.9) calorieAdjustment += 50;

    // Generate with adjusted calories
    const baseCalories = user.profile.dailyCalories || DEFAULT_CALORIES;
    return generateMealPlan(
      userId, 
      Math.max(MIN_CALORIES, Math.min(MAX_CALORIES, baseCalories + calorieAdjustment))
    );

  } catch (error) {
    console.error('Next week plan generation failed:', error.message);
    throw error;
  }
};

module.exports = { 
  generateMealPlan,
  generateNextWeekPlan 
};