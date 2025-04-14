import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/ProfileSetup.css';

const ProfileSetupPage = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    goal: 'lose',
    dietaryPreferences: [],
    allergies: [],
    dislikes: [],
    targetWeight: '',
    targetBodyFat: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: checked
        ? [...prev.dietaryPreferences, value]
        : prev.dietaryPreferences.filter(item => item !== value)
    }));
  };

  const handleArrayInput = (e) => {
    const { name, value } = e.target;
    const arrayValue = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    setFormData(prev => ({
      ...prev,
      [name]: arrayValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const requiredFields = ['age', 'gender', 'height', 'weight', 'activityLevel', 'goal', 'targetWeight', 'targetBodyFat'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const payload = {
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
        targetWeight: Number(formData.targetWeight),
        targetBodyFat: Number(formData.targetBodyFat),
        dietaryPreferences: Array.isArray(formData.dietaryPreferences) ? formData.dietaryPreferences : [],
        allergies: typeof formData.allergies === 'string' ?
          formData.allergies.split(',').map(item => item.trim()) :
          formData.allergies || [],
        dislikes: typeof formData.dislikes === 'string' ?
          formData.dislikes.split(',').map(item => item.trim()) :
          formData.dislikes || []
      };

      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Submission Error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-setup-container">
      <h2>Complete Your Profile</h2>
      <p>Help us create your personalized diet plan</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} min="13" max="120" required />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Height (cm)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange} min="100" max="250" required />
          </div>

          <div className="form-group">
            <label>Current Weight (kg)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="30" max="300" required />
          </div>
        </div>

        <div className="form-section">
          <h3>Activity & Goals</h3>
          <div className="form-group">
            <label>Activity Level</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} required>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="moderate">Moderate (exercise 3–4 times/week)</option>
              <option value="active">Active (exercise 5+ times/week)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Goal</label>
            <select name="goal" value={formData.goal} onChange={handleChange} required>
              <option value="lose">Lose Weight</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Gain Weight</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Weight (kg)</label>
            <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} min="30" max="300" required />
          </div>

          <div className="form-group">
            <label>Target Body Fat %</label>
            <input type="number" name="targetBodyFat" value={formData.targetBodyFat} onChange={handleChange} min="5" max="50" step="0.1" required />
          </div>
        </div>

        <div className="form-section">
          <h3>Dietary Preferences</h3>
          <div className="checkbox-group">
            {['vegetarian', 'vegan', 'keto', 'gluten-free', 'dairy-free'].map(option => (
              <label key={option}>
                <input
                  type="checkbox"
                  name="dietaryPreferences"
                  value={option}
                  checked={formData.dietaryPreferences.includes(option)}
                  onChange={handleCheckboxChange}
                />
                {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
              </label>
            ))}
          </div>

          <div className="form-group">
            <label>Allergies (comma separated)</label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies.join(', ')}
              onChange={handleArrayInput}
              placeholder="e.g. peanuts, shellfish"
            />
            <p className="input-hint">Enter full food names, not abbreviations</p>
          </div>

          <div className="form-group">
            <label>Dislikes (comma separated)</label>
            <input
              type="text"
              name="dislikes"
              value={formData.dislikes.join(', ')}
              onChange={handleArrayInput}
              placeholder="e.g. mushrooms, olives"
            />
            <p className="input-hint">Enter full food names, not abbreviations</p>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetupPage;