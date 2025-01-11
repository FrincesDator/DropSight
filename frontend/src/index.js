// src/index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './core/style/splash-screen.css'; // Import your splash screen styles
import chickenArt from './assets/images/chickenArt.gif';

const SplashScreen = ({ onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone(); // Notify parent when done
    }, 2000); // 2000ms delay

    return () => clearTimeout(timer); // Cleanup the timer
  }, [onDone]);

  return (
    <div className="splash-container">
      <img src={chickenArt} alt="Chicken Art" className="splash-image" />
    </div>
  );
};

const Root = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashDone = () => {
    setShowSplash(false); // Hide splash screen
  };

  return (
    <>
      {showSplash ? (
        <SplashScreen onDone={handleSplashDone} />
      ) : (
        <App />
      )}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
