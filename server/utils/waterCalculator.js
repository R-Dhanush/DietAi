// utils/waterCalculator.js
const calculateWaterRequirement = ({ weight, activityLevel }) => {
  // Base water requirement (30-35 ml per kg of body weight)
  const baseWater = weight * 35;
  
  // Additional water based on activity level
  const activityAdjustments = {
    sedentary: 1,
    moderate: 1.2,
    active: 1.5
  };
  
  return Math.round(baseWater * (activityAdjustments[activityLevel] || 0));
};

module.exports = { calculateWaterRequirement };