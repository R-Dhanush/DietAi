import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Header.css'

const Header = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          DietAI
        </Link>
        
        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>
        
        <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                <Link to="/features" className="nav-link" onClick={closeMenu}>Features</Link>
                <Link to="/about" className="nav-link" onClick={closeMenu}>About</Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/features" className="nav-link" onClick={closeMenu}>Features</Link>
                <Link to="/about" className="nav-link" onClick={closeMenu}>About</Link>
                <div className="auth-buttons">
                  <Link to="/login" className="login-btn" onClick={closeMenu}>Login</Link>
                  <Link to="/register" className="register-btn" onClick={closeMenu}>Register</Link>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;