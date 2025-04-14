import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import '../../styles/dashboard/DailyLogForm.css';

const DailyLogForm = ({ todayPlan, onLogSubmit }) => {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [todayLog, setTodayLog] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    meals: [],
    waterIntake: { 
      amount: 0, 
      target: user?.dailyWaterTarget || 2000
    },
    weight: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '--';
    return Number(num).toFixed(1);
  };

  useEffect(() => {
    const checkTodayLog = async () => {
      try {
        const profileResponse = await api.get('/api/profile/me');
        const waterTarget = profileResponse.data?.dailyWaterTarget || 
                          profileResponse.data?.profile?.dailyWaterTarget || 
                          2000;
        
        setFormData(prev => ({
          ...prev,
          waterIntake: {
            ...prev.waterIntake,
            target: waterTarget
          }
        }));

        const logCheck = await api.get('/api/daily-logs/check-today');
        const logExists = logCheck.data.exists && logCheck.data.completed;
        setAlreadySubmitted(logExists);
        
        if (logExists) {
          const logResponse = await api.get('/api/daily-logs/today');
          setTodayLog(logResponse.data);
          
          if (logResponse.data.weight) {
            setFormData(prev => ({
              ...prev,
              weight: logResponse.data.weight
            }));
          }
        }
      } catch (error) {
        console.error('Error checking log:', error);
      }
    };

    checkTodayLog();

    if (todayPlan?.meals) {
      setFormData(prev => ({
        ...prev,
        meals: Array.isArray(todayPlan.meals) 
          ? todayPlan.meals.map(meal => ({
              mealId: meal.id?.toString() || '',
              title: meal.title || '',
              status: 'pending',
              nutrition: meal.nutrition || {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
              }
            }))
          : []
      }));
    }
  }, [todayPlan]);

  const handleMealStatusChange = (mealId, status) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.map(meal => 
        meal.mealId === mealId ? { ...meal, status } : meal
      )
    }));
  };

  const handleWaterChange = (e) => {
    setFormData(prev => ({
      ...prev,
      waterIntake: { 
        ...prev.waterIntake, 
        amount: Math.max(0, Number(e.target.value)) 
      }
    }));
  };

  const handleWeightChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      weight: Math.max(0, Number(e.target.value)) 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    if (!formData.weight || isNaN(formData.weight)) {
      alert('Please enter a valid weight');
      setIsSubmitting(false);
      return;
    }
  
    try {
      const totalNutrition = formData.meals
        .filter(meal => meal.status === 'eaten')
        .reduce((totals, meal) => {
          return {
            calories: totals.calories + (meal.nutrition?.calories || 0),
            protein: totals.protein + (meal.nutrition?.protein || 0),
            carbs: totals.carbs + (meal.nutrition?.carbs || 0),
            fat: totals.fat + (meal.nutrition?.fat || 0)
          };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
      const submissionData = {
        weight: formData.weight,
        waterIntake: {
          amount: formData.waterIntake.amount,
          target: formData.waterIntake.target
        },
        meals: formData.meals.map(meal => ({
          mealId: meal.mealId,
          status: meal.status,
          nutrition: meal.nutrition
        })),
        totalNutrition,
        completed: true
      };
  
      await api.post('/api/daily-logs', submissionData);
      
      await api.put('/api/profile/update-weight', {
        currentWeight: formData.weight
      });

      const logResponse = await api.get('/api/daily-logs/today');
      setTodayLog(logResponse.data);
      setAlreadySubmitted(true);
      
      if (typeof onLogSubmit === 'function') {
        await onLogSubmit();
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to submit log';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alreadySubmitted) {
    return (
      <div className="daily-log-card submitted-view">
        <div className="submitted-header">
          <div className="checkmark-circle">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <h3>Today's Log Submitted</h3>
        </div>
        <p className="submitted-text">Great job tracking your nutrition today!</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Weight</div>
            <div className="stat-value">
              {todayLog?.weight ? `${formatNumber(todayLog.weight)} kg` : '--'}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Water Intake</div>
            <div className="stat-value">
              {todayLog?.waterIntake?.amount ? `${formatNumber(todayLog.waterIntake.amount)} ml` : '--'}
            </div>
            <div className="stat-progress">
              <div 
                className="progress-bar" 
                style={{
                  width: `${Math.min(
                    (todayLog?.waterIntake?.amount / formData.waterIntake.target) * 100, 
                    100
                  )}%`
                }}
              ></div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Calories</div>
            <div className="stat-value">
              {todayLog?.totalNutrition?.calories ? 
                `${formatNumber(todayLog.totalNutrition.calories)} kcal` : 
                '--'
              }
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Protein</div>
            <div className="stat-value">
              {todayLog?.totalNutrition?.protein ? 
                `${formatNumber(todayLog.totalNutrition.protein)}g` : 
                '--'
              }
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Carbs</div>
            <div className="stat-value">
              {todayLog?.totalNutrition?.carbs ? 
                `${formatNumber(todayLog.totalNutrition.carbs)}g` : 
                '--'
              }
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Fat</div>
            <div className="stat-value">
              {todayLog?.totalNutrition?.fat ? 
                `${formatNumber(todayLog.totalNutrition.fat)}g` : 
                '--'
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eatenMeals = formData.meals.filter(meal => meal.status === 'eaten');
  const totalCalories = eatenMeals.reduce((sum, meal) => sum + (meal.nutrition?.calories || 0), 0);

  return (
    <div className="daily-log-card">
      <form onSubmit={handleSubmit}>
        <div className="section-header">
          <h3>Daily Log</h3>
          <div className="calories-summary">
            <span>Total Calories:</span>
            <strong>{totalCalories} kcal</strong>
          </div>
        </div>

        <div className="meal-log-section">
          <h4>Meal Tracking</h4>
          {formData.meals.length > 0 ? (
            <div className="meal-list">
              {formData.meals.map(meal => (
                <div key={meal.mealId} className="meal-item">
                  <div className="meal-contents">
                    <div className="meal-title">{meal.title}</div>
                    <div className="meal-nutrition">
                      {meal.nutrition?.calories || 0} kcal
                    </div>
                  </div>
                  <div className="meal-actions">
                    <button
                      type="button"
                      className={`status-btn ${meal.status === 'eaten' ? 'active' : ''}`}
                      onClick={() => handleMealStatusChange(meal.mealId, 'eaten')}
                    >
                      <span className="icon">✓</span> Eaten
                    </button>
                    <button
                      type="button"
                      className={`status-btn ${meal.status === 'skipped' ? 'active' : ''}`}
                      onClick={() => handleMealStatusChange(meal.mealId, 'skipped')}
                    >
                      <span className="icon">✕</span> Skipped
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No meals planned for today</p>
            </div>
          )}
        </div>

        <div className="water-log-section">
          <h4>Water Intake</h4>
          <div className="water-input-container">
            <div className="water-input">
              <input
                type="number"
                min="0"
                max="10000"
                value={formData.waterIntake.amount}
                onChange={handleWaterChange}
                aria-label="Water intake amount"
              />
              <span className="unit">ml</span>
            </div>
            <div className="water-target">
              Target: {formData.waterIntake.target} ml
            </div>
          </div>
          <div className="water-progress">
            <div 
              className="water-progress-bar"
              style={{
                width: `${Math.min(
                  (formData.waterIntake.amount / formData.waterIntake.target) * 100, 
                  100
                )}%`
              }}
              aria-label="Water intake progress"
            ></div>
          </div>
        </div>

        <div className="weight-log-section">
          <h4>Today's Weight</h4>
          <div className="weight-input">
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="Enter your weight"
              value={formData.weight || ''}
              onChange={handleWeightChange}
              required
              aria-label="Current weight"
            />
            <span className="unit">kg</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || !formData.weight}
          aria-label="Submit daily log"
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            'Complete Daily Log'
          )}
        </button>
      </form>
    </div>
  );
};

export default DailyLogForm;