import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import FeatureCard from '../components/FeatureCard';
import TestimonialCard from '../components/TestimonialCard';
import Footer from '../components/Footer';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const features = [
    {
      title: "Personalized Diet Plans",
      description: "AI-powered weekly meal plans tailored to your goals and preferences.",
      icon: "🍎"
    },
    {
      title: "Progress Tracking",
      description: "Monitor your weight, water intake, and streaks with detailed analytics.",
      icon: "📊"
    },
    {
      title: "Smart Recommendations",
      description: "Adaptive suggestions based on your progress and feedback.",
      icon: "🤖"
    }
  ];

  const testimonials = [
    {
      name: "Sarah J.",
      text: "Lost 15 pounds in 2 months with personalized plans that actually fit my busy schedule!",
      avatar: "👩"
    },
    {
      name: "Mike T.",
      text: "The streak system kept me motivated, and I finally reached my fitness goals.",
      avatar: "👨"
    },
    {
      name: "Priya K.",
      text: "As a vegetarian, I love how the AI understands my dietary preferences perfectly.",
      avatar: "👩‍🦰"
    }
  ];

  return (
    <div className="landing-page">
      <Header />
      
      <main>
        <section className="hero">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Your Personalized AI Diet Assistant</h1>
              <p className="hero-description">Get custom meal plans, track your progress, and achieve your health goals faster with our smart recommendation system.</p>
              <Link to="/register" className="cta-button">Get Started</Link>
            </div>
            <div className="hero-image">
              <div className="image-placeholder">🍏🥦🥑</div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="features-container">
            <h2 className="section-title">How It Works</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="testimonials">
          <div className="testimonials-container">
            <h2 className="section-title">Success Stories</h2>
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  name={testimonial.name}
                  text={testimonial.text}
                  avatar={testimonial.avatar}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-container">
            <h2 className="cta-title">Ready to Transform Your Eating Habits?</h2>
            <Link to="/register" className="cta-button">Start Your Journey Today</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;