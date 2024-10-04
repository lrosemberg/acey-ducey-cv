import React from 'react';
import './ThemeToggle.css';
const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="theme-toggle-container">
      <div className={`theme-toggle ${isDarkMode ? 'dark' : ''}`} onClick={toggleTheme}>
        <div className="toggle-slider"></div>
        <span className="theme-icon">
          {isDarkMode ? '☀️' : '🌙'}
        </span>
      </div>
    </div>
  );
};

export default ThemeToggle;