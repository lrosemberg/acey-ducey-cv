import React from 'react';
import ThemeToggle  from '../theme-toggle/ThemeToggle';
import Logo from '../../assets/images/logo.png';
import './Header.css';

const Header = ({ toggleTheme, isDarkMode }) => {
    return (
        <header className="header">
            <div className="header-left">
                <img src={Logo} alt="Acey Ducey Card Counter" className="logo" />
                <h1>Acey Ducey Card Counter</h1>
            </div>
            <div className="header-right">
                <ThemeToggle toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
            </div>
        </header>
    );
};

export default Header;
