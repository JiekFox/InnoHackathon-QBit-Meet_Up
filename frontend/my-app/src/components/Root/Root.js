import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useState } from 'react';

export default function Root() {
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    const toggleLanguage = () => alert('Language toggled!');

    return (
        <div className="body" data-theme={theme}>
            <header>
                <Navbar
                    onLanguageToggle={toggleLanguage}
                    onThemeToggle={toggleTheme}
                    userName="User Name"
                />
            </header>
            <main id="detail" className="main-content">
                <Outlet />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}
