import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import '../styles/Dashboard.css';

// Dashboard components
import UserProfileSummary from '../components/dashboard/UserProfileSummary';
import ProgressGraph from '../components/dashboard/ProgressGraph';
import StreakTracker from '../components/dashboard/StreakTracker';
import MealPlanWeekView from '../components/dashboard/MealPlanWeekView';
import DailyLogForm from '../components/dashboard/DailyLogForm';
import GoalTracker from '../components/dashboard/GoalTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../utils/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    userProfile: null,
    mealPlan: { days: [] },
    progress: {
      weightHistory: [],
      calorieHistory: [],
      calorieTarget: 2000,
      waterHistory: [],
      waterTarget: 2000
    },
    streak: 0,
    badges: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, mealPlanRes, progressRes] = await Promise.all([
        api.get('/api/profile/me'),
        api.get('/api/meal-plan/current'),
        api.get('/api/progress')
      ]);

      const calorieTarget = profileRes.data?.profile?.dailyCalories || 
                         progressRes?.data?.calorieTarget || 
                         2000;

      const waterTarget = progressRes?.data?.waterTarget < 10 ? 
        progressRes.data.waterTarget * 1000 : 
        progressRes?.data?.waterTarget || 2000;

      const mealPlan = mealPlanRes.data?.days ? mealPlanRes.data : { days: [] };

      setDashboardData({
        userProfile: profileRes.data,
        mealPlan,
        progress: {
          weightHistory: progressRes?.data?.weightHistory || [],
          calorieHistory: progressRes?.data?.calorieHistory || [],
          calorieTarget,
          waterHistory: progressRes?.data?.waterHistory || [],
          waterTarget: waterTarget
        },
        streak: profileRes.data?.streak?.current || 0,
        badges: profileRes.data?.badges || []
      });

    } catch (err) {
      console.error('Dashboard data error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
      return;
    }
    
    if (isAuthenticated) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGenerateNewPlan = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/meal-plan/generate');
      const newPlan = response.data;
      setDashboardData(prev => ({
        ...prev,
        mealPlan: newPlan
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate new meal plan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSubmit = async () => {
    try {
      await fetchDashboardData();
    } catch (err) {
      console.error('Error refreshing after log submission:', err);
      setError(err.message);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading && !dashboardData.userProfile) {
    return <LoadingSpinner fullPage message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={fetchDashboardData}
        fullPage
      />
    );
  }
  
  return (
    <div className="dashboard-layout">
      <Header />
      <main className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome back, {dashboardData.userProfile?.name || 'User'}</h1>
          <p className="dashboard-subtitle">Here's your progress and today's plan</p>
        </header>

        <div className="dashboard-grid">
          {/* Stack all components vertically */}
          <section className="dashboard-card profile-section">
            <UserProfileSummary 
              user={dashboardData.userProfile} 
              onEdit={() => navigate('/profile-setup')} 
            />
          </section>
          
          <section className="dashboard-card streak-section">
            <StreakTracker streak={dashboardData.streak} />
          </section>
          
          <section className="dashboard-card progress-section">
            <ProgressGraph 
              weightHistory={dashboardData.progress.weightHistory}
              calorieHistory={dashboardData.progress.calorieHistory}
              calorieTarget={dashboardData.progress.calorieTarget}
              waterHistory={dashboardData.progress.waterHistory}
              waterTarget={dashboardData.progress.waterTarget}
            />
          </section>
          
          <section className="dashboard-card goal-section">
            <GoalTracker 
              currentWeight={dashboardData.userProfile?.profile?.currentWeight}
              targetWeight={dashboardData.userProfile?.profile?.targetWeight}
              initialWeight={dashboardData.userProfile?.profile?.initialWeight}
              goal={dashboardData.userProfile?.profile?.goal}
            />
          </section>

          <section className="dashboard-card plan-section">
            <MealPlanWeekView 
              weekPlan={dashboardData.mealPlan} 
              onRegenerate={handleGenerateNewPlan}
              isLoading={loading}
            />
          </section>
          
          <section className="dashboard-card log-section">
            <DailyLogForm 
              todayPlan={dashboardData.mealPlan.days?.[0] || { meals: [] }}
              onLogSubmit={handleLogSubmit}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;