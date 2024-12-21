import React, { useEffect, useState } from 'react';
import '../../../core/style/splash-screen.css';
import logoW from '../../../assets/images/logoW.gif';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 2000); // 2000ms delay

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  useEffect(() => {
    if (showLogin) {
      navigate('/login'); // Ensure this matches the route in your App.js
    }
  }, [showLogin, navigate]);

  return (
    <div className="splash-container">
      <img src={logoW} alt="Chicken Art" className="splash-image" />
    </div>
  );
};

export default SplashScreen;
