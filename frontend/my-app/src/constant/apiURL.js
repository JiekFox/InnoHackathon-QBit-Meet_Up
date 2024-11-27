export const BASE_API_URL = 'https://innohackathon-qbit-meet-up.onrender.com/api/';
export const MEETINGS_API_URL = BASE_API_URL + 'meetings/';
export const TOKEN_API_URL = BASE_API_URL + 'token/';

export const USER_API_URL = BASE_API_URL + 'users/';
export const REGISTER_API_URL = USER_API_URL + 'register/';

export const giveConfig = token => {
    if (!token || !token.access) {
        console.error('No access token provided.');
        return null;
    }

    return {
        headers: {
            Authorization: `Bearer ${token.access}`
        }
    };
};
