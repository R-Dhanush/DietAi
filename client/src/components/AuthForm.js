import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/AuthPages.css';

const AuthForm = ({ fields, submitText, authType, onError }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validatePassword = (password) => {
    if (!password) return { isValid: false, message: 'Password is required' };
    
    const requirements = [];
    if (password.length < 8) requirements.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) requirements.push('one uppercase letter');
    if (!/[a-z]/.test(password)) requirements.push('one lowercase letter');
    if (!/[0-9]/.test(password)) requirements.push('one number');
    if (!/[^A-Za-z0-9]/.test(password)) requirements.push('one special character');

    return {
      isValid: requirements.length === 0,
      message: requirements.length > 0 
        ? `Password must contain: ${requirements.join(', ')}` 
        : null
    };
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return null;
      
      case 'password':
        if (authType === 'register') {
          const { message } = validatePassword(value);
          return message;
        }
        if (!value) return 'Password is required';
        return null;
      
      case 'confirmPassword':
        if (value !== formData.password) return 'Passwords do not match';
        return null;
      
      case 'name':
        if (!value) return 'Full name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        return null;
      
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Only hide requirements if field is empty
    if (!value) {
      setShowPasswordRequirements(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Show requirements when typing starts
    if (value && !showPasswordRequirements) {
      setShowPasswordRequirements(true);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = authType === 'login' 
        ? '/api/auth/login' 
        : '/api/auth/register';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      login(data.token, data.user);
      navigate(authType === 'login' ? '/dashboard' : '/profile-setup');
    } catch (err) {
      console.error('Authentication error:', err);
      if (onError) {
        onError(err);
      } else {
        setErrors({ form: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {errors.form && (
        <div className="form-error-message">
          {errors.form}
        </div>
      )}

{fields.map((field) => (
        <div className="form-group" key={field.name}>
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            onChange={field.name === 'password' ? handlePasswordChange : handleChange}
            onBlur={field.name === 'password' ? handlePasswordBlur : handleBlur}
            onFocus={field.name === 'password' ? handlePasswordFocus : undefined}
            className={`form-input ${errors[field.name] ? 'input-error' : ''}`}
            value={formData[field.name] || ''}
          />
          {errors[field.name] && (
            <div className="field-error-message">
              {errors[field.name]}
            </div>
          )}
          {field.name === 'password' && authType === 'register' && showPasswordRequirements && (
            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={formData.password?.length >= 8 ? 'met' : ''}>At least 8 characters</li>
                <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>One uppercase letter</li>
                <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>One lowercase letter</li>
                <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>One number</li>
                <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'met' : ''}>One special character</li>
              </ul>
            </div>
          )}
        </div>
      ))}

      <button 
        type="submit" 
        className="auth-submit-btn" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : submitText}
      </button>
    </form>
  );
};

export default AuthForm;