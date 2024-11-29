import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
} from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('');

    useEffect(() => {
        const storedTheme = localStorage.getItem('appTheme');

        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        if (theme !== '') {
            localStorage.setItem('appTheme', theme);
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const value = {
        theme,
        toggleTheme
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
