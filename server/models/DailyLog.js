const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema({
  mealId: {
    type: String,
    ref: 'Meal'
  },
  status: {
    type: String,
    enum: ['eaten', 'skipped', 'replaced'],
    required: true
  },
  replacedWith: String,
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }
}, { _id: false });

const DailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  meals: [mealLogSchema],
  waterIntake: {
    amount: Number,
    target: Number
  },
  weight: Number,
  totalNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure one log per user per day
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);