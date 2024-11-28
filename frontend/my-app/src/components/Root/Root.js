import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useState } from 'react';
import { AuthProvider } from '../../utils/AuthContext';

export default function Root() {
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <AuthProvider>
            <div className="body" data-theme={theme}>
                <Navbar theme={theme} onThemeToggle={toggleTheme} />

                <main id="detail" className="main-content">
                    <Outlet />
                </main>
                <footer>
                    <Footer />
                </footer>
            </div>
        </AuthProvider>
    );
}
