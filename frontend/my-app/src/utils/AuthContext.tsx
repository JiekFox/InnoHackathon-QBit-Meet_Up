import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
    ReactNode
} from 'react';

import { USER_API_URL } from '../constant/apiURL';
import axios from 'axios';
import { AuthContextType, AuthToken, AuthResponseData } from '../constant/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<AuthToken | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [userID, setUserID] = useState<number | null>(null);
    const [img, setImg] = useState<string | null | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);

    const saveToken = useCallback((newToken: AuthToken | null) => {
        setToken(newToken);
        localStorage.setItem('authToken', JSON.stringify(newToken));
    }, []);

    const saveName = useCallback((newName: string) => {
        setName(newName);
        localStorage.setItem('name', JSON.stringify(newName));
    }, []);

    const saveId = useCallback((newID: number) => {
        setUserID(newID);
        localStorage.setItem('ID', JSON.stringify(newID));
    }, []);

    const saveDate = useCallback(
        (newDate: AuthResponseData) => {
            saveToken({ refresh: newDate.refresh, access: newDate.access });
            saveName(newDate.username);
            saveId(newDate.user_id);
            setLoading(false);
        },
        [saveToken, saveName, saveId]
    );

    const removeToken = useCallback(() => {
        setToken(null);
        setUserID(null);
        setName(null);
        setImg(undefined);
        localStorage.removeItem('authToken');
        localStorage.removeItem('name');
        localStorage.removeItem('ID');
    }, []);

    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        const savedName = localStorage.getItem('name');
        const savedID = localStorage.getItem('ID');

        if (savedToken) {
            try {
                const parsedToken: AuthToken | null = JSON.parse(savedToken);
                setToken(parsedToken);
            } catch (error) {
                console.error('Failed to parse token from localStorage:', error);
            }
        }

        if (savedName) {
            try {
                const parsedName: string = JSON.parse(savedName);
                setName(parsedName);
            } catch (error) {
                console.error('Failed to parse name from localStorage:', error);
            }
        }

        if (savedID) {
            try {
                const parsedID: number = JSON.parse(savedID);
                setUserID(parsedID);
            } catch (error) {
                console.error('Failed to parse ID from localStorage:', error);
            }
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        async function giveImg() {
            try {
                const response = await axios.get(`${USER_API_URL}${userID}/`);
                setImg(response.data.photo);
            } catch (err: any) {
                console.error(err.message);
            }
        }

        if (userID) {
            giveImg();
        }
    }, [userID]);
    console.log(token);
    const value: AuthContextType = {
        token,
        userID,
        name,
        img,
        saveToken,
        removeToken,
        saveDate,
        loading
    };

    return loading ? (
        <div>Loading...</div>
    ) : (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
