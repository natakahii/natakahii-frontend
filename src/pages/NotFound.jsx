import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoHome, IoSearch, IoArrowBack, IoRocket } from 'react-icons/io5';
import { Colors } from '../constants/theme';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="notfound-container">
      {/* Animated Background Elements */}
      <div className="notfound-bg">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
        <div className="floating-circle circle-4"></div>
      </div>

      <div className="notfound-content">
        {/* Animated 404 */}
        <div className="notfound-number">
          <span className="number-4 number-left">4</span>
          <div className="number-0-wrapper">
            <IoRocket className="rocket-icon" size={80} />
            <div className="orbit-ring"></div>
          </div>
          <span className="number-4 number-right">4</span>
        </div>

        {/* Text Content */}
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-subtitle">
          Oops! The page you're looking for seems to have wandered off.
        </p>
        <p className="notfound-description">
          Don't worry, even the best explorers get lost sometimes.
        </p>

        {/* Action Buttons */}
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn primary">
            <IoHome size={20} />
            <span>Back to Home</span>
          </Link>
          <Link to="/browse" className="notfound-btn secondary">
            <IoSearch size={20} />
            <span>Browse Products</span>
          </Link>
        </div>

        {/* Auto Redirect Counter */}
        <div className="redirect-info">
          <div className="countdown-circle">
            <svg className="countdown-svg" viewBox="0 0 100 100">
              <circle
                className="countdown-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className="countdown-progress"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDashoffset: `${(countdown / 10) * 283}`,
                }}
              />
            </svg>
            <span className="countdown-number">{countdown}</span>
          </div>
          <p className="redirect-text">
            Redirecting to home in <strong>{countdown}</strong> seconds
          </p>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <button onClick={() => navigate(-1)} className="quick-link">
            <IoArrowBack size={16} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
