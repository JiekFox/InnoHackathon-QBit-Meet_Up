import React, { createContext, useState, useContext, useEffect } from 'react';

// Создаем контекст
const AuthContext = createContext();

// Хук для доступа к AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// Провайдер для управления токеном
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null); // Токен
    const [name, setName] = useState(null); // Имя пользователя
    const [userID, setUserID] = useState(null); // ID пользователя

    // Сохранение токена в localStorage
    const saveToken = newToken => {
        setToken(newToken);
        localStorage.setItem('authToken', JSON.stringify(newToken)); // Сохраняем токен в формате JSON
    };
    const saveName = newName => {
        setName(newName);
        localStorage.setItem('name', JSON.stringify(newName)); // Сохраняем токен в формате JSON
    };
    const saveId = newID => {
        setUserID(newID);
        localStorage.setItem('ID', JSON.stringify(newID)); // Сохраняем токен в формате JSON
    };
    const saveDate = newDate => {
        console.log(newDate);
        saveToken({
            refresh: newDate.refresh,
            access: newDate.access
        });
        saveName(newDate.username);
        saveId(newDate.user_id);
    };

    // Удаление токена из состояния и localStorage
    const removeToken = () => {
        setToken(null);
        setUserID(null);
        setName(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('name');
        localStorage.removeItem('ID');
    };

    // Загрузка токена из localStorage при инициализации
    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            try {
                const parsedToken = JSON.parse(savedToken); // Парсим токен
                setToken(parsedToken);
                //console.log("Token loaded from localStorage:", parsedToken);
            } catch (error) {
                console.error('Failed to parse token from localStorage:', error);
            }
        }
        const savedName = localStorage.getItem('name');
        if (savedName) {
            try {
                const parsedName = JSON.parse(savedName); // Парсим токен
                setName(parsedName);
                //console.log("Token loaded from localStorage:", parsedToken);
            } catch (error) {
                console.error('Failed to parse name from localStorage:', error);
            }
        }
        const savedID = localStorage.getItem('ID');
        if (savedID) {
            try {
                const parsedID = JSON.parse(savedID); // Парсим токен
                setUserID(parsedID);
                //console.log("Token loaded from localStorage:", parsedToken);
            } catch (error) {
                console.error('Failed to parse ID from localStorage:', error);
            }
        }
    }, []);
    console.log(name, userID, token);
    /*
  // Обработка токена (например, извлечение ID пользователя)
  useEffect(() => {
    if (token && token.access) {
      try {
        const extractedUserID = getUserIdFromToken(token.access); // Извлекаем ID из токена
        setUserID(extractedUserID);
        console.log("User ID from token:", extractedUserID);
      } catch (error) {
        console.error("Error extracting user ID from token:", error);
      }
    } else {
      console.log("No valid token available.");
    }
  }, [token]);*/
    /*
  // Получение данных о пользователе по ID
  useEffect(() => {
    if (userID) {
      const { data: meetup, loading, error } = useFetchMeetings(
          `${MEETINGS_API_URL}${userID}/`
      );

      if (loading) {
        console.log("Loading user data...");
      }

      if (error) {
        console.error("Error fetching user data:", error);
      }

      if (meetup && meetup.name) {
        setName(meetup.name); // Сохраняем имя пользователя
        console.log("User name fetched:", meetup.name);
      }
    }
  }, [userID]);*/

    // Контекстное значение
    const value = {
        token,
        userID,
        name,
        saveToken,
        removeToken,
        saveDate
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
