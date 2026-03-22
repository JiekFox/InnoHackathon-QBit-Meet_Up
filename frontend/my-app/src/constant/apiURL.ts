export const BASE_API_URL = 'https://innohackathon-qbit-meet-up.onrender.com/api/';
export const MEETINGS_API_URL = BASE_API_URL + 'meetings/';
export const TAGS_API_URL = BASE_API_URL + 'tags/';
export const TOKEN_API_URL = BASE_API_URL + 'token/';

export const USER_API_URL = BASE_API_URL + 'users/';
export const REGISTER_API_URL = USER_API_URL + 'register/';
export const MEETUP_DETAILS_API_URL = BASE_API_URL + 'meetup-details/';

export const TOKEN_REFRESH_URL = BASE_API_URL + 'token/refresh/';

export const GPT_URL = String(
    import.meta.env.VITE_GPT_URL || 'https://qbit-gpt-integration.onrender.com'
).replace(/\/+$/, '');
