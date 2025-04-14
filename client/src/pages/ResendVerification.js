import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/AuthPages.css';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/resend-verification', { email });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
      setMessage('');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Resend Verification Email</h2>
        
        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="auth-submit-btn">
            Resend Verification
          </button>
        </form>
        
        <div className="auth-footer">
          Remembered your password? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;