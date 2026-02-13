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
import {
    AuthContextType,
    AuthToken,
    AuthResponseData,
    AuthState
} from '../constant/types';

const initialState: AuthState = {
    token: null,
    name: null,
    userID: null,
    role: 'user',
    img: undefined,
    loading: true
};

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
    const [authState, setAuthState] = useState<AuthState>(initialState);

    const saveToken = useCallback((newToken: AuthToken | null) => {
        setAuthState(prev => ({ ...prev, token: newToken }));
        localStorage.setItem('authToken', JSON.stringify(newToken));
    }, []);

    const saveName = useCallback((newName: string) => {
        setAuthState(prev => ({ ...prev, name: newName }));
        localStorage.setItem('name', JSON.stringify(newName));
    }, []);

    const saveId = useCallback((newID: number) => {
        setAuthState(prev => ({ ...prev, userID: newID }));
        localStorage.setItem('ID', JSON.stringify(newID));
    }, []);

    const saveRole = useCallback((newRole: 'admin' | 'user') => {
        setAuthState(prev => ({ ...prev, role: newRole }));
        localStorage.setItem('role', JSON.stringify(newRole));
    }, []);

    const saveDate = useCallback(
        (newDate: AuthResponseData) => {
            if (newDate.refresh && newDate.access) {
                saveToken({ refresh: newDate.refresh, access: newDate.access });
            }
            saveName(newDate.username);
            saveId(newDate.user_id);
            if (newDate.role) {
                saveRole(newDate.role as 'admin' | 'user');
            }
            setAuthState(prev => ({ ...prev, img: newDate.photo, loading: false }));
        },
        [saveToken, saveName, saveId, saveRole]
    );

    const removeToken = useCallback(() => {
        setAuthState({...initialState, loading: false});
        localStorage.removeItem('authToken');
        localStorage.removeItem('name');
        localStorage.removeItem('ID');
        localStorage.removeItem('role');
    }, []);

    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        const savedName = localStorage.getItem('name');
        const savedID = localStorage.getItem('ID');
        const savedRole = localStorage.getItem('role');

        const newState: AuthState = { ...initialState };

        if (savedToken) {
            try {
                newState.token = JSON.parse(savedToken);
            } catch (error) {
                console.error('Failed to parse token from localStorage:', error);
            }
        }

        if (savedName) {
            try {
                newState.name = JSON.parse(savedName);
            } catch (error) {
                console.error('Failed to parse name from localStorage:', error);
            }
        }

        if (savedID) {
            try {
                newState.userID = JSON.parse(savedID);
            } catch (error) {
                console.error('Failed to parse ID from localStorage:', error);
            }
        }

        if (savedRole) {
            try {
                newState.role = JSON.parse(savedRole) as 'admin' | 'user';
            } catch (error) {
                console.error('Failed to parse role from localStorage:', error);
            }
        }

        newState.loading = false;
        setAuthState(newState);
    }, []);

    useEffect(() => {
        async function giveImg() {
            try {
                const response = await axios.get(
                    `${USER_API_URL}${authState.userID}/`
                );
                setAuthState(prev => ({ ...prev, img: response.data.photo }));
            } catch (err: any) {
                console.error(err.message);
            }
        }

        if (authState.userID) {
            giveImg();
        }
    }, [authState.userID]);

    const value: AuthContextType = {
        token: authState.token,
        userID: authState.userID,
        name: authState.name,
        img: authState.img,
        role: authState.role,
        loading: authState.loading,
        saveToken,
        removeToken,
        saveDate
    };

    return authState.loading ? (
        <div>Loading...</div>
    ) : (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
