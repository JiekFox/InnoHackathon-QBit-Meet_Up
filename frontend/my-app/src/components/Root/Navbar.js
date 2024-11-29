import UserMenu from './UserMenu';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BASE, SIGN_IN } from '../../constant/router';
import { useAuth } from '../../utils/AuthContext';
import { useTheme } from '../../utils/ThemeContext';
import logo from '../../assets/img/handle_color_green.png';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { name } = useAuth();

    const handleLogoClick = () => {
        if (location.pathname === BASE || location.pathname === BASE + '/') {
            window.location.reload();
        } else {
            navigate(BASE);
        }
    };
    return (
        <header className="header">
            <div className="container">
                <div className="logo-title" onClick={handleLogoClick}>
                    <img src={logo} alt="logo" />
                    <h1 className="title">Meet Up!</h1>
                </div>
                <div className="controls">
                    <div className="theme-switch">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                            />
                            <span className="slider round">
                                <span className={'moon'}>🌜</span>
                                <span className={'sun'}>🌞</span>
                            </span>
                        </label>
                    </div>

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
