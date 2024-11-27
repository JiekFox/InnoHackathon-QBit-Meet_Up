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
