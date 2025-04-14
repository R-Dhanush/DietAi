const User = require('../models/User');

const calculateCurrentStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.dailyLogs) return 0;
    
    const logs = [...user.dailyLogs].sort((a, b) => b.date - a.date);
    if (logs.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if logged today
    const today = new Date(currentDate);
    if (logs[0].date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Check consecutive previous days
    for (const log of logs) {
      const logDate = new Date(log.date).setHours(0, 0, 0, 0);
      const expectedDate = new Date(currentDate).setHours(0, 0, 0, 0);
      
      if (logDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (logDate < expectedDate) {
        break; // Streak broken
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

module.exports = { calculateCurrentStreak };