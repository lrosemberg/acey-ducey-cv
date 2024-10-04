import React from 'react';

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className={`theme-toggle ${isDarkMode ? 'dark' : ''}`} onClick={toggleTheme}>
      <div className="toggle-slider"></div>
      <span className="theme-icon">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
    </div>
  );
};

export default ThemeToggle;