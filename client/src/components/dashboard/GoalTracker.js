import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/dashboard/GoalTracker.css';

const GoalTracker = ({ currentWeight, targetWeight, goal, initialWeight }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate progress
  let remaining, percentage;
  
  if (goal === 'lose') {
    remaining = currentWeight - targetWeight;
    const totalToLose = initialWeight - targetWeight;
    const weightLost = initialWeight - currentWeight;
    percentage = totalToLose > 0 ? Math.min(Math.round((weightLost / totalToLose) * 100), 100) : 100;
  } else if (goal === 'gain') {
    remaining = targetWeight - currentWeight;
    const totalToGain = targetWeight - initialWeight;
    const weightGained = currentWeight - initialWeight;
    percentage = totalToGain > 0 ? Math.min(Math.round((weightGained / totalToGain) * 100), 100) : 100;
  } else {
    percentage = 100;
    remaining = 0;
  }

  // Check if goal is reached
  const goalReached = goal === 'lose' 
    ? currentWeight <= targetWeight 
    : goal === 'gain' 
      ? currentWeight >= targetWeight 
      : false;

  useEffect(() => {
    if (goalReached) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [goalReached]);

  const handleMaintenance = () => {
    setIsMaintenance(true);
  };

  const handleNewGoal = () => {
    setIsMaintenance(false);
    // In a real app, this would trigger a modal or navigation to set new goals
  };

  return (
    <motion.div 
      className={`goal-tracker-card ${goalReached ? 'goal-reached' : ''} ${isMaintenance ? 'maintenance-mode' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.2}
          />
        )}
      </AnimatePresence>
      
      <h3>Goal Progress</h3>
      
      {goalReached ? (
        <motion.div 
          className="goal-complete"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="celebrate-emoji"
            animate={{ 
              y: [0, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5
            }}
          >
            {isMaintenance ? '⚖️' : '🎉'}
          </motion.div>
          
          <h4>
            {isMaintenance 
              ? 'Maintenance Mode Activated' 
              : 'Goal Achieved!'}
          </h4>
          
          <p>
            {isMaintenance
              ? 'You are now maintaining your target weight.'
              : 'Congratulations! You reached your target weight!'}
          </p>
          
          <div className="goal-actions">
            {!isMaintenance && (
              <motion.button
                className="maintenance-btn"
                onClick={handleMaintenance}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Enter Maintenance
              </motion.button>
            )}
            <motion.button
              className={`new-goal-btn ${isMaintenance ? 'maintenance-active' : ''}`}
              onClick={handleNewGoal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMaintenance ? 'Adjust Maintenance' : 'Set New Goal'}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar"
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            ></motion.div>
            <span className="progress-text">{percentage}%</span>
          </div>
          
          <div className="progress-details">
            <motion.div 
              className="progress-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span>Current</span>
              <strong>{currentWeight} kg</strong>
            </motion.div>
            
            <motion.div 
              className="progress-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span>Target</span>
              <strong>{targetWeight} kg</strong>
            </motion.div>
            
            <motion.div 
              className="progress-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span>Remaining</span>
              <strong>
                {goal === 'lose' 
                  ? `${remaining.toFixed(1)} kg to lose` 
                  : goal === 'gain' 
                    ? `${remaining.toFixed(1)} kg to gain` 
                    : 'Maintaining'}
              </strong>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default GoalTracker;