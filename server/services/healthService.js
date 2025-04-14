const User = require('../models/User');

class HealthService {
  static async calculateWaterRequirement(user) {
    const weight = user.profile?.currentWeight || user.profile?.weight;
    if (!weight) return 2000;
    
    // Basic water requirement calculation (ml per day)
    // 35ml per kg of body weight
    const baseRequirement = weight * 35;
    
    // Adjust for activity level
    let activityMultiplier = 1;
    if (user.profile.activityLevel === 'moderate') activityMultiplier = 1.2;
    if (user.profile.activityLevel === 'active') activityMultiplier = 1.5;
    
    const totalWater = Math.round(baseRequirement * activityMultiplier);
    
    // Update user's daily target
    user.dailyWaterTarget = totalWater;
    await user.save();
    
    return totalWater;
  }

  static async calculateDailyCalories(user) {
    // Mifflin-St Jeor Equation (same as before)
    let bmr;
    if (user.profile.gender === 'male') {
      bmr = 10 * user.profile.weight + 6.25 * user.profile.height - 5 * user.profile.age + 5;
    } else {
      bmr = 10 * user.profile.weight + 6.25 * user.profile.height - 5 * user.profile.age - 161;
    }

    let activityMultiplier;
    switch (user.profile.activityLevel) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.2;
    }

    let tdee = bmr * activityMultiplier;
    
    // Adjust for goal
    if (user.profile.goal === 'lose') {
      tdee -= 500;
    } else if (user.profile.goal === 'gain') {
      tdee += 500;
    }

    return Math.round(tdee);
  }
}

module.exports = HealthService;