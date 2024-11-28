import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { AuthProvider } from '../../utils/AuthContext';

const Root = React.memo(() => {
    const [theme, setTheme] = useState('dark');

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

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
});

export default Root;
