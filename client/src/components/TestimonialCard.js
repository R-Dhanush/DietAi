import React from 'react';

const TestimonialCard = ({ name, text, avatar }) => {
  return (
    <div className="testimonial-card">
      <div className="testimonial-avatar">{avatar}</div>
      <div className="testimonial-content">
        <p className="testimonial-text">"{text}"</p>
        <p className="testimonial-name">- {name}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;