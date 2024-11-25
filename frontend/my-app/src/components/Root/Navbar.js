import UserMenu from './UserMenu';
import { NavLink } from 'react-router-dom';
import { BASE } from '../../constant/router';

export default function Navbar({ onLanguageToggle, onThemeToggle, userName }) {
    return (
        <header className="header">
            <div className="container">
                <NavLink to={BASE}>
                    <h1 className="title">Meet Up!</h1>
                </NavLink>
                <div className="controls">
                    <button onClick={onLanguageToggle} className="control-button">
                        Change Language
                    </button>
                    <button onClick={onThemeToggle} className="control-button">
                        Change Theme
                    </button>
                    <UserMenu userName={userName} />
                </div>
            </div>
        </header>
    );
}
