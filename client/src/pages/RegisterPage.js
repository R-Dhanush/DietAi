import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import '../styles/AuthPages.css';

const RegisterPage = () => {
  const [verificationSent, setVerificationSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const registerFields = [
    { name: 'name', type: 'text', placeholder: 'Full Name', required: true },
    { name: 'email', type: 'email', placeholder: 'Email Address', required: true },
    { name: 'password', type: 'password', placeholder: 'Password', required: true },
    { name: 'confirmPassword', type: 'password', placeholder: 'Confirm Password', required: true }
  ];

  const handleSubmit = async (formData) => {
    try {
      setEmail(formData.email);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.message.includes('already exists')) {
          throw new Error('An account with this email already exists');
        }
        throw new Error(data.message || 'Registration failed');
      }

      setVerificationSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      setVerificationSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h2>Verify Your Email</h2>
          <p>We've sent a verification link to <strong>{email}</strong></p>
          <p>Please check your inbox and click the link to verify your account.</p>
          
          <div className="resend-section">
            <p>Didn't receive the email?</p>
            <button 
              onClick={handleResendVerification}
              className="auth-submit-btn"
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          
          <div className="auth-footer">
            <button onClick={() => navigate('/login')} className="text-link">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Your Account</h2>
        <p>Start your personalized diet journey today</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <AuthForm 
          fields={registerFields}
          submitText="Register"
          authType="register"
          onSubmit={handleSubmit}
          onError={(err) => setError(err.message)}
        />
        
        <div className="auth-footer">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;