const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const dailyLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  meals: [{
    mealId: mongoose.Schema.Types.ObjectId,
    status: { type: String, enum: ['eaten', 'skipped', 'replaced'] },
    replacedWith: String
  }],
  waterIntake: Number,
  weight: Number,
  notes: String
});

const goalSchema = new mongoose.Schema({
  type: { type: String, enum: ['weight', 'bodyFat', 'streak'] },
  targetValue: Number,
  startValue: Number,
  currentValue: Number,
  startDate: Date,
  targetDate: Date,
  achieved: { type: Boolean, default: false },
  achievedAt: Date
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  profile: {
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    height: Number, // in cm
    initialWeight: Number,
    currentWeight: Number,
    activityLevel: {
      type: String,
      enum: ['sedentary', 'moderate', 'active']
    },
    goal: {
      type: String,
      enum: ['lose', 'maintain', 'gain']
    },
    dietaryPreferences: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'keto', 'gluten-free', 'dairy-free', 'none']
    }],
    allergies: [String],
    dislikes: [String],
    targetWeight: Number,
    targetBodyFat: Number,
    timeFrame: Number, // in weeks
    dailyCalories: Number,
    dailyMacros: {
      protein: Number,
      carbs: Number,
      fats: Number
    },
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: () => ({})
  },
  currentMealPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MealPlan'
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastLogged: Date
  },
  dailyWaterTarget: {
    type: Number,
    default: 2000
  },
  dailyLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyLog'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', UserSchema);