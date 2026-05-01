import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { AuthProvider } from '../../utils/AuthContext';
import { ThemeProvider, useTheme } from '../../utils/ThemeContext';

const RootContent = React.memo(() => {
    const { theme } = useTheme();

    return (
        <div className="body" data-theme={theme}>
            <Navbar />
            <main id="detail" className="main-content">
                <Outlet />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
});

const Root = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <RootContent />
            </ThemeProvider>
        </AuthProvider>
    );
};

export default Root;
