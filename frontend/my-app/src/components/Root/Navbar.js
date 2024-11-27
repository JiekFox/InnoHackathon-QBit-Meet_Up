import UserMenu from './UserMenu';
import { NavLink } from 'react-router-dom';
import { BASE, SIGN_IN } from '../../constant/router';
import { useAuth } from '../../utils/AuthContext';

export default function Navbar({ onThemeToggle }) {
    const { name } = useAuth();
    return (
        <header className="header">
            <div className="container">
                <NavLink to={BASE}>
                    <h1 className="title">Meet Up!</h1>
                </NavLink>
                <div className="controls">
                    <button onClick={onThemeToggle} className="control-button">
                        Change Theme
                    </button>
                    {name ? (
                        <UserMenu userName={name} />
                    ) : (
                        <NavLink
                            className="navbar-sign-in sign-in-link"
                            to={SIGN_IN}
                        >
                            <p>Sign in.</p>
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    );
}
