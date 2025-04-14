import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/InfoPages.css';

const TermsOfService = () => {
  return (
    <>
    <Header /> 
    <div className="info-page">
      <div className="info-header">
        <h1>Terms of Service</h1>
        <p>Last updated: April 13, 2025</p>
      </div>
      
      <div className="info-content">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using DietAI, you agree to be bound by these Terms. If you disagree, you may not
            use our services.
          </p>
        </section>
        
        <section>
          <h2>2. Service Description</h2>
          <p>
            DietAI provides AI-generated meal plans and nutrition tracking tools. Our recommendations
            are for informational purposes only and should not replace professional medical advice.
          </p>
        </section>
        
        <section>
          <h2>3. User Responsibilities</h2>
          <p>
            You agree to:
            <ul>
              <li>Provide accurate information about your health and dietary needs</li>
              <li>Consult a healthcare professional before making significant dietary changes</li>
              <li>Not misuse our services or attempt to reverse-engineer our algorithms</li>
            </ul>
          </p>
        </section>
        
        <section>
          <h2>4. Subscription and Payments</h2>
          <p>
            Premium features require a subscription. Payments are non-refundable except as required by law.
            You may cancel at any time.
          </p>
        </section>
        
        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            DietAI is not liable for any health outcomes resulting from use of our services. We make no
            guarantees about weight loss or other health results.
          </p>
        </section>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default TermsOfService;