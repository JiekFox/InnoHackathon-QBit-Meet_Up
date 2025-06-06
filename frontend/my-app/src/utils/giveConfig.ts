import { AuthToken, Config } from '../constant/types';
export const giveConfig = (token: AuthToken | null): Config | null => {
    if (!token) return null;
    return {
        headers: {
            Authorization: `Bearer ${token.access}`
        }
    };
};
