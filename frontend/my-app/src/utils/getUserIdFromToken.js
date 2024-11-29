import { jwtDecode } from 'jwt-decode';

const getUserIdFromToken = accessToken => {
    if (!accessToken) {
        console.error('Access token is missing.');
        return null;
    }

    try {
        const decodedToken = jwtDecode(accessToken);

        return decodedToken.user_id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export default getUserIdFromToken;
