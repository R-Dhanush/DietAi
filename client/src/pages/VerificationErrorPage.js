import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/VerificationPages.css';

const VerificationErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="verification-page verification-error">
      <div className="verification-icon">✕</div>
      <h2>Verification Failed</h2>
      <p>The verification link is invalid or has expired.</p>
      <div className="verification-footer">
        <button 
          onClick={() => navigate('/register')} 
          className="verification-btn"
        >
          Register Again
        </button>
        <p>Or <a href="/" className="verification-link">return to home</a></p>
      </div>
    </div>
  );
};

export default VerificationErrorPage;