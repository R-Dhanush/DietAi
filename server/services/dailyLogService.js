const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const { calculateWaterRequirement } = require('./healthService');

class DailyLogService {
  static async createDailyLog(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Calculate water requirement if not provided
    const waterTarget = data.waterIntake?.target || 
      await calculateWaterRequirement(user);

    // Calculate total nutrition
    const totalNutrition = data.meals.reduce((acc, meal) => {
      if (meal.status === 'eaten' && meal.nutrition) {
        acc.calories += meal.nutrition.calories || 0;
        acc.protein += meal.nutrition.protein || 0;
        acc.carbs += meal.nutrition.carbs || 0;
        acc.fat += meal.nutrition.fat || 0;
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const logData = {
      userId,
      meals: data.meals,
      waterIntake: {
        amount: data.waterIntake.amount,
        target: waterTarget
      },
      weight: data.weight,
      totalNutrition,
      completed: true
    };

    const dailyLog = await DailyLog.findOneAndUpdate(
      { userId, date: { $gte: new Date().setHours(0,0,0,0) } },
      logData,
      { upsert: true, new: true }
    );

    // Update streak
    await this.updateStreak(userId);

    return dailyLog;
  }

  static async updateStreak(userId) {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if already logged today
    if (user.streak.lastLogged && 
        new Date(user.streak.lastLogged).setHours(0,0,0,0) === today.getTime()) {
      return;
    }

    // Check if logged yesterday (continuous streak)
    if (user.streak.lastLogged && 
        new Date(user.streak.lastLogged).setHours(0,0,0,0) === yesterday.getTime()) {
      user.streak.current += 1;
    } else {
      // Reset if missed a day
      user.streak.current = 1;
    }

    // Update longest streak if needed
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }

    user.streak.lastLogged = new Date();
    await user.save();

    // Check for streak milestones
    this.checkStreakMilestones(userId, user.streak.current);
  }

  static async checkStreakMilestones(userId, streak) {
    const milestones = [3, 7, 14, 30];
    if (milestones.includes(streak)) {
      const messages = {
        3: "Great start! You've got a 3-day streak going!",
        7: "Awesome! One week of consistency!",
        14: "Incredible! Two weeks strong!",
        30: "Amazing! You've logged for a full month!"
      };
      
      // Create a notification
      await Notification.create({
        userId,
        type: 'streak_milestone',
        title: `🎉 ${streak}-Day Streak!`,
        message: messages[streak],
        isRead: false
      });
    }
  }
}

module.exports = DailyLogService;