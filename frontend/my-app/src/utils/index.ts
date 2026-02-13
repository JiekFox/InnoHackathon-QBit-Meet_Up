import { AxiosError } from 'axios';

interface ApiErrorResponse {
    errors?: Array<{ detail: string; attr: string; code: string }>;
    detail?: string;
    message?: string;
    [key: string]: any;
}

/**
 * Извлекает описание ошибки из AxiosError
 * @param error - Ошибка (AxiosError или любая другая)
 * @param defaultMessage - Сообщение по умолчанию
 * @returns Описание ошибки
 */
export const getErrorDescription = (
    error: unknown,
    defaultMessage: string = 'An error occurred'
): string => {
    // Если это AxiosError
    const axiosError = error as AxiosError<ApiErrorResponse>;

    if (axiosError?.response?.data) {
        const data = axiosError.response.data;

        // Вариант 1: errors[0].detail
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            return data.errors[0].attr + ': ' + data.errors[0].detail;
        }

        // Вариант 2: detail
        if (data.detail) {
            return typeof data.detail === 'string' ? data.detail : defaultMessage;
        }

        // Вариант 3: message
        if (data.message) {
            return typeof data.message === 'string' ? data.message : defaultMessage;
        }
    }

    // Если это обычная ошибка с message
    if (error instanceof Error) {
        return error.message;
    }

    // Значение по умолчанию
    return defaultMessage;
};
