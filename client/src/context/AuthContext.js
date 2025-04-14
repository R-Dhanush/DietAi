import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    showAlert: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token and get user data
          const response = await api.get('/api/auth/me');
          const userData = response.data;
          
          setAuthState({
            isAuthenticated: true,
            user: userData,
            isLoading: false
          });

          setVerificationStatus({
            isVerified: userData.isVerified,
            showAlert: !userData.isVerified
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false
          });
        }
      } catch (err) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    };
    
    checkAuth();
  }, []);

  const login = async (token, userData) => {
    localStorage.setItem('token', token);
    setAuthState({
      isAuthenticated: true,
      user: userData,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
    navigate('/login');
  };

  if (authState.isLoading) {
    return <div>Loading authentication...</div>;
  }

  const useAuth = () => {
    return useContext(AuthContext);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      isLoading: authState.isLoading,
      verificationStatus,
      setVerificationStatus,
      login,
      logout,
      useAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};