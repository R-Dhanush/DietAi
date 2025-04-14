import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/VerificationPages.css';

const VerificationSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="verification-page verification-success">
      <div className="verification-icon">✓</div>
      <h2>Email Verified Successfully!</h2>
      <p>Your account has been verified. You'll be redirected to login shortly.</p>
      <div className="verification-footer">
        <p>Or <a href="/login" className="verification-link">click here</a> to login now.</p>
      </div>
    </div>
  );
};

export default VerificationSuccessPage;