import { useAuth } from '../AuthContext';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { TOKEN_REFRESH_URL } from '../../constant/apiURL';
import { AuthResponseData } from '../../constant/types';

interface DecodedToken {
    exp: number;
}

const isTokenExpired = (token: string): boolean => {
    try {
        const { exp } = jwtDecode<DecodedToken>(token);
        const now = Math.floor(Date.now() / 1000);
        return exp < now;
    } catch {
        return true;
    }
};

const errorText =
    'The server is not responding. Try refreshing the page or coming back later.';
const errorCode = 'ECONNABORTED';
const TIMEOUT_MS = 10000;

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new AxiosError(errorText, errorCode));
        }, timeoutMs);

        promise
            .then(res => {
                clearTimeout(timeoutId);
                resolve(res);
            })
            .catch(err => {
                clearTimeout(timeoutId);
                reject(err);
            });
    });
};

export const useAxiosWithAuth = (): AxiosInstance => {
    const { token, saveToken, removeToken } = useAuth();

    const instance = axios.create({
        timeout: TIMEOUT_MS
    });

    instance.interceptors.request.use(
        async config => {
            let currentToken = token;
            if (!currentToken) {
                return config;
            }

            // double check it
            const currentLang = localStorage.getItem('i18nextLng') || 'en';
            config.headers = Object.assign({}, config.headers, {
                'Accept-Language': currentLang
            });

            if (isTokenExpired(currentToken.access)) {
                console.log('Please wait, additional authorization is underway.');
                try {
                    const response = await withTimeout(
                        axios.post<AuthResponseData>(
                            TOKEN_REFRESH_URL,
                            { refresh: currentToken.refresh },
                            { headers: { 'Content-Type': 'application/json' } }
                        ),
                        TIMEOUT_MS
                    );

                    console.log('successful authorization', response.data);
                    saveToken({
                        refresh: currentToken.refresh,
                        access: response.data.access
                    });

                    currentToken = {
                        access: response.data.access,
                        refresh: response.data.refresh //refresh: currentToken.refresh
                    };
                } catch (err) {
                    console.error('Ошибка при обновлении токена:', err);
                    removeToken();
                    throw new axios.Cancel('Session expired');
                }
            }

            config.headers = Object.assign({}, config.headers, {
                Authorization: `Bearer ${currentToken.access}`,
                'Accept-Language': currentLang
            });

            return config;
        },
        error => Promise.reject(error)
    );

    instance.interceptors.response.use(
        response => response,
        async error => {
            if (error.code === errorCode || error.message.includes('timeout')) {
                return Promise.reject(new AxiosError(errorText));
            }

            try {
                const config = error.config;
                if (!config || config._retry) {
                    return Promise.reject(error);
                }

                config._retry = true;
                return await withTimeout(instance.request(config), TIMEOUT_MS);
            } catch (err) {
                return Promise.reject(err);
            }
        }
    );

    return instance;
};
