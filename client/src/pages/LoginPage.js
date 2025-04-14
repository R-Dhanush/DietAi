import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import '../styles/AuthPages.css';

const LoginPage = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loginFields = [
    { name: 'email', type: 'email', placeholder: 'Email Address', required: true },
    { name: 'password', type: 'password', placeholder: 'Password', required: true }
  ];

  const handleLoginError = (err) => {
    console.error('Login error:', err);
    
    // Clear previous error
    setError(null);
    
    // Specific handling for unverified accounts
    if (err.message.includes('verify') || err.message.includes('Please verify your email')) {
      setError(
        <div className="verification-error-message">
          <p>Please verify your email before logging in.</p>
          <p>Check your inbox or <button 
            className="text-link" 
            onClick={() => navigate('/resend-verification')}
          >
            resend verification email
          </button></p>
        </div>
      );
    } else if (err.message.includes('Invalid credentials')) {
      setError('Invalid email or password. Please try again.');
    } else {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <p>Log in to continue your diet journey</p>
        
        {error && (
          <div className={`auth-error ${typeof error === 'string' && error.includes('verify') ? 'verification-error' : ''}`}>
            {error}
          </div>
        )}
        
        <AuthForm 
          fields={loginFields}
          submitText="Login"
          authType="login"
          onError={handleLoginError}
        />
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;