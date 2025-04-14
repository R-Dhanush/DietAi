import React from 'react';
import '../../styles/dashboard/UserProfileSummary.css';

const UserProfileSummary = ({ user, onEdit }) => {
  const safeUser = user || {};
  const profile = safeUser.profile || {};
  
  // Format weight values with kg suffix
  const formatWeight = (weight) => weight ? `${weight} kg` : 'Not set';
  
  // Format height with cm suffix
  const formatHeight = (height) => height ? `${height} cm` : 'Not set';
  
  // Format goal text
  const formatGoal = (goal) => {
    switch(goal) {
      case 'lose': return 'Lose Weight';
      case 'gain': return 'Gain Weight';
      case 'maintain': return 'Maintain Weight';
      default: return 'Not set';
    }
  };
  
  // Format activity level
  const formatActivity = (level) => {
    switch(level) {
      case 'sedentary': return 'Sedentary';
      case 'moderate': return 'Moderate';
      case 'active': return 'Active';
      default: return 'Not set';
    }
  };
  
  // Format calories with kcal suffix
  const formatCalories = (calories) => calories ? `${calories} kcal` : 'Not set';

  return (
    <div className="profile-summary-card">
      <div className="profile-header">
        <h3>Profile Summary</h3>
        <button onClick={onEdit} className="edit-btn" aria-label="Edit profile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit Profile
        </button>
      </div>
      
      <div className="profile-details">
        <div className="detail-item">
          <span className="detail-label">Age</span>
          <span className="detail-value">{profile.age || 'Not set'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Height</span>
          <span className="detail-value">{formatHeight(profile.height)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Initial Weight</span>
          <span className="detail-value">{formatWeight(profile.initialWeight)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Current Weight</span>
          <span className="detail-value">{formatWeight(profile.currentWeight)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Goal</span>
          <span className="detail-value">{formatGoal(profile.goal)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Activity Level</span>
          <span className="detail-value">{formatActivity(profile.activityLevel)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Target Weight</span>
          <span className="detail-value">{formatWeight(profile.targetWeight)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Daily Calories</span>
          <span className="detail-value">{formatCalories(profile.dailyCalories)}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSummary;