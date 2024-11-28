import UserMenu from './UserMenu';
import { NavLink, useNavigate } from 'react-router-dom';
import { BASE, SIGN_IN } from '../../constant/router';
import { useAuth } from '../../utils/AuthContext';
import { useTheme } from '../../utils/ThemeContext';
import logo from '../../assets/img/handle_color_green.png';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { name } = useAuth();
    return (
        <header className="header">
            <div className="container">
                <NavLink to={BASE}>
                    <div className="logo-title">
                        <img src={logo} alt="logo" />
                        <h1 className="title">Meet Up!</h1>
                    </div>
                </NavLink>
                <div className="controls">
                    <button onClick={toggleTheme} className="control-button">
                        Change Theme{theme === 'dark' ? ' 🌜' : ' 🌞'}
                    </button>
                    {name ? (
                        <UserMenu userName={name} />
                    ) : (
                        <button
                            onClick={() => navigate(SIGN_IN)}
                            className="control-button"
                        >
                            Sign in.
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
/*

import React from 'react';
import { useTheme } from '../../utils/ThemeContext';

export default function Navbar()  {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="navbar">
            <h1>My App</h1>
            <button onClick={toggleTheme} className="theme-toggle">
                Change Theme{theme === 'dark' ? ' 🌜' : ' 🌞'}
            </button>
        </nav>
    );
};
export default Navbar;
*/
