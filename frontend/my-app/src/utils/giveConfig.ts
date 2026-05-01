import { AuthToken, Config } from '../constant/types';
export const giveConfig = (token: AuthToken | null): Config | undefined => {
    if (!token) return undefined;
    return {
        headers: {
            Authorization: `Bearer ${token.access}`
        }
    };
};
