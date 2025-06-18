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
const errorText = 'The server is not responding. Try again later.';
// ⏱️ Обёртка для тайм-аута любого Promise
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new AxiosError(errorText));
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
    const instance = axios.create();

    instance.interceptors.request.use(
        async config => {
            let currentToken = token;
            if (!currentToken) {
                return config;
            }
            if (isTokenExpired(currentToken.access)) {
                console.log('Please wait, additional authorization is underway.');
                try {
                    const response = await withTimeout(
                        axios.post<AuthResponseData>(
                            TOKEN_REFRESH_URL,
                            { refresh: currentToken.refresh },
                            { headers: { 'Content-Type': 'application/json' } }
                        ),
                        10000
                    );
                    console.log('successful authorization', response.data);
                    saveToken({
                        refresh: currentToken.refresh,
                        access: response.data.access
                    });

                    currentToken = {
                        access: response.data.access,
                        refresh: response.data.refresh
                    };
                } catch (err) {
                    console.error('Ошибка при обновлении токена:', err);
                    removeToken();
                    return config;
                }
            }

            config.headers = Object.assign({}, config.headers, {
                Authorization: `Bearer ${currentToken.access}`
            });

            return config;
        },
        error => Promise.reject(error)
    );

    //работает ли?
    instance.interceptors.response.use(
        response => response,
        async error => {
            // если ошибка связана с timeout — пробрасываем как есть
            if (error.message === errorText) {
                /*return Promise.reject(error);*/
                console.log(error.message);
                throw error;
            }

            // иначе пробуем заново с таймаутом
            try {
                const config = error.config;
                if (!config || config._retry) {
                    return Promise.reject(error);
                }

                config._retry = true;

                return await withTimeout(axios.request(config), 10000);
            } catch (err) {
                return Promise.reject(err);
            }
        }
    );

    return instance;
};
