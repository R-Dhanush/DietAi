import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/AuthPages.css';

const NotFoundPage = () => {
  return (
    <>
    <Header /> 
    <div className="auth-page">
      <div className="auth-container">
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="home-link">Go back to home</Link>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default NotFoundPage;