const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: Date,
  days: [{
    date: Date,
    meals: [{
      id: Number,
      title: String,
      image: String,
      readyInMinutes: Number,
      servings: Number,
      nutrition: {
        calories: Number,
        protein: Number,
        fat: Number,
        carbs: Number
      }
    }],
    nutrients: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
