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
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem('appTheme');
        console.log(storedTheme);
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    useEffect(() => {
        console.log('set', theme);
        localStorage.setItem('appTheme', theme);
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
