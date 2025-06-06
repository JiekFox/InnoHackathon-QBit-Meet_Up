import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    user_id: number;
}

const getUserIdFromToken = (accessToken: string): number | null => {
    if (!accessToken) {
        console.error('Access token is missing.');
        return null;
    }

    try {
        const decodedToken = jwtDecode<DecodedToken>(accessToken);
        return decodedToken.user_id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export default getUserIdFromToken;
