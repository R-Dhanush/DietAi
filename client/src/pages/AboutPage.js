import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/InfoPages.css';

const AboutPage = () => {
  return (
    <>
      <Header />
      <div className="info-page">
        <div className="info-header">
          <h1>About DietAI</h1>
          <p>Our mission to make healthy eating simple and personalized</p>
        </div>
        
        <div className="info-content">
          <section>
            <h2>Our Story</h2>
            <p>
              Founded in 2025, DietAI was born from a simple idea: healthy eating shouldn't be complicated.
              Our team of nutritionists, chefs, and AI experts came together to create a solution that takes
              the guesswork out of meal planning.
            </p>
          </section>
          
          <section>
            <h2>How It Works</h2>
            <p>
              Using advanced machine learning algorithms, DietAI analyzes your profile, preferences, and goals
              to create perfectly tailored meal plans. We combine nutritional science with culinary expertise
              to deliver plans that are both healthy and delicious.
            </p>
          </section>
          
          <section>
            <h2>Meet The Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="avatar">👩‍⚕️</div>
                <h3>Dr. Sarah Chen</h3>
                <p>Head of Nutrition</p>
              </div>
              <div className="team-member">
                <div className="avatar">👨‍💻</div>
                <h3>Mark Johnson</h3>
                <p>Lead Developer</p>
              </div>
              <div className="team-member">
                <div className="avatar">👩‍🍳</div>
                <h3>Elena Rodriguez</h3>
                <p>Executive Chef</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;