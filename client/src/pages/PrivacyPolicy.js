import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/InfoPages.css';

const PrivacyPolicy = () => {
  return (
    <>
    <Header /> 
    <div className="info-page">
      <div className="info-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: April 13, 2025</p>
      </div>
      
      <div className="info-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including account details, profile information,
            dietary preferences, and health goals. We also automatically collect usage data through cookies
            and similar technologies.
          </p>
        </section>
        
        <section>
          <h2>2. How We Use Your Information</h2>
          <p>
            Your data is used to:
            <ul>
              <li>Provide and personalize our services</li>
              <li>Generate meal plans and recommendations</li>
              <li>Improve our algorithms and services</li>
              <li>Communicate with you about your account</li>
            </ul>
          </p>
        </section>
        
        <section>
          <h2>3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information.
            All health data is encrypted and stored securely.
          </p>
        </section>
        
        <section>
          <h2>4. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You can manage your
            privacy settings in your account dashboard or contact us directly.
          </p>
        </section>
        
        <section>
          <h2>5. Contact Us</h2>
          <p>
            For any privacy-related questions, please contact our Data Protection Officer at:
            privacy@dietai.com
          </p>
        </section>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default PrivacyPolicy;