import React from 'react';
import './Header.css';
import ThemeToggle  from '../theme-toggle/ThemeToggle';

const Header = ({ toggleTheme, isDarkMode }) => {
    return (
        <header className="header">
            <h1>Acey Ducey Card Counter</h1>
            <ThemeToggle toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        </header>
    );
};

export default Header;
