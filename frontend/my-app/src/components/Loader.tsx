import logoDark from '../assets/img/handle_color_black.png';
import logoLight from '../assets/img/handle_color_white.png';

import { useTheme } from '../utils/ThemeContext';
export default function Loader() {
    const { theme } = useTheme();
    return (
        <div className="loader">
            <img
                src={theme === 'dark' ? logoLight : logoDark}
                alt="Loading..."
                className="loader-logo"
            />
        </div>
    );
}
