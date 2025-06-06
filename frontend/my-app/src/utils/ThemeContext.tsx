import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode
} from 'react';

export interface ThemeContextValue {
    theme: string;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<string>('');

    useEffect(() => {
        const storedTheme = localStorage.getItem('appTheme');
        setTheme(storedTheme || 'dark');
    }, []);

    useEffect(() => {
        if (theme !== '') {
            localStorage.setItem('appTheme', theme);
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const value: ThemeContextValue = {
        theme,
        toggleTheme
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
