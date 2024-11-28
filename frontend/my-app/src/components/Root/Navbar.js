import UserMenu from './UserMenu';
import { NavLink, useNavigate } from 'react-router-dom';
import { BASE, SIGN_IN } from '../../constant/router';
import { useAuth } from '../../utils/AuthContext';

export default function Navbar({ onThemeToggle, theme }) {
    const navigate = useNavigate();
    const { name } = useAuth();
    return (
        <header className="header">
            <div className="container">
                <NavLink to={BASE}>
                    <h1 className="title">Meet Up!</h1>
                </NavLink>
                <div className="controls">
                    <button onClick={onThemeToggle} className="control-button">
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
