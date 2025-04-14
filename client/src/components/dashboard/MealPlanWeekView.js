import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/dashboard/MealPlanWeekView.css';

const MealPlanWeekView = ({ weekPlan = { days: [] }, onRegenerate, onRefresh, isLoading }) => {
  const [activeDay, setActiveDay] = useState(0);
  
  // Generate week dates starting from today
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = weekPlan.days || [];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!days || days.length === 0) {
    return (
      <motion.div 
        className="meal-plan-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="empty-state">
          <h3>Weekly Meal Plan</h3>
          <p>No meal plan found for this week</p>
          <motion.button 
            onClick={onRegenerate} 
            className="generate-btn"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Generating...
              </>
            ) : (
              'Generate New Plan'
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="meal-plan-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="meal-plan-header">
        <div>
          <h3>Weekly Meal Plan</h3>
          <p className="current-date-range">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </p>
        </div>
        <motion.button 
          onClick={onRegenerate} 
          className="regenerate-btn"
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span> Regenerating...
            </>
          ) : (
            'Regenerate Plan'
          )}
        </motion.button>
      </div>
      
      <div className="day-selector-container">
        <div className="day-selector">
          {weekDates.map((date, index) => (
            <motion.button
              key={index}
              className={`day-tab ${index === activeDay ? 'active' : ''}`}
              onClick={() => setActiveDay(index)}
              disabled={index >= days.length}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="short-day">{shortDayNames[date.getDay()]}</span>
              <span className="full-day">{dayNames[date.getDay()]}</span>
              <span className="date">{formatDate(date)}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          className="day-meals"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {days[activeDay]?.meals?.length > 0 ? (
            days[activeDay].meals.map((meal) => (
              <MealCard key={meal.id || meal._id || Math.random()} meal={meal} />
            ))
          ) : (
            <div className="no-meals-message">
              <p>No meals planned for this day</p>
              <button 
                className="add-meal-btn"
                onClick={() => console.log('Add meal clicked')}
              >
                + Add Meal
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

MealPlanWeekView.propTypes = {
  weekPlan: PropTypes.shape({
    days: PropTypes.arrayOf(
      PropTypes.shape({
        meals: PropTypes.array,
        date: PropTypes.string
      })
    )
  }),
  onRegenerate: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
  isLoading: PropTypes.bool
};

MealPlanWeekView.defaultProps = {
  weekPlan: { days: [] },
  isLoading: false
};

const MealCard = ({ meal }) => {
  const nutrition = meal.nutrition || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  return (
    <motion.div 
      className="meal-card"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="meal-image-container">
        <img
          src={meal.image || 'https://spoonacular.com/recipeImages/default-recipe.jpg'}
          alt={meal.title}
          className="meal-image"
          onError={(e) => {
            e.target.src = 'https://spoonacular.com/recipeImages/default-recipe.jpg';
          }}
        />
        <div className="meal-type-badge">
          {meal.type || 'Meal'}
        </div>
      </div>
      <div className="meal-content">
        <h3 className="meal-title">{meal.title}</h3>
        
        <div className="nutrition-grid">
          <div className="nutrition-item">
            <span className="nutrition-label">Calories</span>
            <span className="nutrition-value calories">{Math.round(nutrition.calories)}</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Protein</span>
            <span className="nutrition-value protein">{Math.round(nutrition.protein)}g</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Carbs</span>
            <span className="nutrition-value carbs">{Math.round(nutrition.carbs)}g</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Fat</span>
            <span className="nutrition-value fat">{Math.round(nutrition.fat)}g</span>
          </div>
        </div>
        
        <div className="meal-meta">
          <span className="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M13 7h-2v6h6v-2h-4z"/>
            </svg>
            {meal.readyInMinutes || 'N/A'} mins
          </span>
          <span className="meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M8 16l5.991-2 2-5.991-5.991 2-2 5.991zm3.826-6.173l1.347-1.347 1.347 1.347-1.347 1.347-1.347-1.347z"/>
            </svg>
            Serves {meal.servings || 1}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MealPlanWeekView;