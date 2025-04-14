import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/dashboard/StreakTracker.css';

const StreakTracker = ({ streak = 0 }) => {
  // Generate fire emojis with staggered animations
  const fireEmojis = Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
    <motion.span
      key={i}
      className="fire-emoji"
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: i * 0.1,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      🔥
    </motion.span>
  ));

  // Get appropriate motivation message with emoji
  const getMotivationMessage = () => {
    if (streak >= 30) return "Legendary streak! 🏆 Keep the fire burning!";
    if (streak >= 14) return "Two weeks strong! 💪 You're unstoppable!";
    if (streak >= 7) return "One week complete! 🌟 Amazing work!";
    if (streak >= 3) return "Great start! ✨ Keep it going!";
    if (streak === 1) return "First day! 🎉 Tomorrow will be day 2!";
    return "Log today to start your streak! 💫";
  };

  // Get streak level for styling
  const getStreakLevel = () => {
    if (streak === 0) return 'beginner';
    if (streak <= 2) return 'starter';
    if (streak <= 6) return 'intermediate';
    if (streak <= 13) return 'advanced';
    if (streak <= 29) return 'expert';
    return 'legendary';
  };

  const streakLevel = getStreakLevel();

  return (
    <motion.div 
      className={`streak-tracker-card ${streakLevel}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <h3>
        <span className="streak-title">Current Streak</span>
        {streak > 0 && (
          <span className="streak-badge">{streakLevel}</span>
        )}
      </h3>
      
      <div className="streak-display">
        {fireEmojis}
        <motion.span 
          className="streak-count"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 15
          }}
        >
          {streak} day{streak !== 1 ? 's' : ''}
        </motion.span>
        {fireEmojis}
      </div>
      
      <motion.p 
        className="motivation-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {getMotivationMessage()}
      </motion.p>
      
      {streak > 0 && (
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
          ></div>
          <div className="progress-markers">
            {[7, 14, 30].map((marker) => (
              <div 
                key={marker}
                className={`marker ${streak >= marker ? 'reached' : ''}`}
                style={{ left: `${(marker / 30) * 100}%` }}
              >
                {marker}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StreakTracker;