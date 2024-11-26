import { jwtDecode } from 'jwt-decode';

const getUserIdFromToken = accessToken => {
    if (!accessToken) {
        console.error('Access token is missing.');
        return null;
    }

    try {
        const decodedToken = jwtDecode(accessToken); // Декодируем токен
        //console.log("Decoded token:", decodedToken); // Логируем для проверки
        return decodedToken.user_id; // Предположим, что ID пользователя хранится под ключом `user_id`
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export default getUserIdFromToken;
