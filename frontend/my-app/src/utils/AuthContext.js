import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback
} from 'react';

import { USER_API_URL } from "../constant/apiURL";
import axios from "axios";


const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [name, setName] = useState(null);
    const [userID, setUserID] = useState(null);
    const [img, setImg] = useState();
    const [loading, setLoading] = useState(true);

    const saveToken = useCallback(newToken => {
        setToken(newToken);
        localStorage.setItem('authToken', JSON.stringify(newToken));
    }, []);
    const saveName = useCallback(newName => {
        setName(newName);
        localStorage.setItem('name', JSON.stringify(newName));
    }, []);
    const saveId = useCallback(newID => {
        setUserID(newID);
        localStorage.setItem('ID', JSON.stringify(newID));
    }, []);
    const saveDate = useCallback(
        newDate => {
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('name');
        localStorage.removeItem('ID');
    }, []);
    console.log(userID);

    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        const savedName = localStorage.getItem('name');
        const savedID = localStorage.getItem('ID');
        if (savedToken) {
            try {
                const parsedToken = JSON.parse(savedToken);
                setToken(parsedToken);
            } catch (error) {
                console.error('Failed to parse token from localStorage:', error);
            }
        }
        if (savedName) {
            try {
                const parsedName = JSON.parse(savedName);
                setName(parsedName);
            } catch (error) {
                console.error('Failed to parse name from localStorage:', error);
            }
        }
        if (savedID) {
            try {
                const parsedID = JSON.parse(savedID);
                setUserID(parsedID);
            } catch (error) {
                console.error('Failed to parse ID from localStorage:', error);
            }
        }
        setLoading(false);
    }, []);
    useEffect(() => {
        async function giveImg() {
            console.log(userID);
            try {
                const response = await axios.get(`${USER_API_URL}${userID}/`);
                console.log(response.data);
                setImg(response.data.photo)
                //setData(response.data);
            } catch (err) {
                //setError(err.message || 'Something went wrong');
            } finally {
                //setLoading(false);
            }
        }
        if(userID) {
            giveImg();
        }
        console.log(img);
        //console.log(data);
        //setImg(data)
    }, [userID]);
    console.log(token);
    const value = {
        token,
        userID,
        name,
        saveToken,
        removeToken,
        saveDate,
        loading,
        img
    };

    return loading ? (
        <div>Loading...</div>
    ) : (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
