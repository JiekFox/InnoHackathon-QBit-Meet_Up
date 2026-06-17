import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { AxiosResponse } from 'axios';
import { TOKEN_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router';
import { AuthResponseData } from '../../constant/types';
import { useAxiosWithAuth } from './useAxiosWithAuth';
import { getErrorDescription } from '..';
import {
    ValidationError,
    getFieldError as getValidationFieldError,
    validateSignInForm
} from '../validators';

interface UseSignInReturn {
    formData: SignInFormData;
    errorMessage: string;
    isPending: boolean;
    showPassword: boolean;
    fieldErrors: ValidationError[];
    getFieldError: (fieldName: string) => string | null;
    togglePasswordVisibility: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface SignInFormData {
    username: string;
    password: string;
}
export const useSignIn = (): UseSignInReturn => {
    const [formData, setFormData] = useState<SignInFormData>({
        username: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isPending, setIsPending] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([]);
    const { saveDate } = useAuth();
    const navigate = useNavigate();
    const axios = useAxiosWithAuth();

    // Validation helper: Update field error
    const updateFieldError = useCallback(
        (fieldName: string, errorMessage: string | null) => {
            setFieldErrors(prev => {
                const filtered = prev.filter(e => e.field !== fieldName);
                if (errorMessage) {
                    return [
                        ...filtered,
                        { field: fieldName, message: errorMessage }
                    ];
                }
                return filtered;
            });
        },
        []
    );

    // Validation helper: Validate all fields
    const validateAllFields = useCallback((): boolean => {
        const errors = validateSignInForm(formData);
        setFieldErrors(errors);
        return errors.length === 0;
    }, [formData]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData(prevData => ({ ...prevData, [name]: value }));
            // Clear error when user starts typing
            updateFieldError(name, null);
        },
        [updateFieldError]
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const { name, value } = e.target;

            if (name === 'username' && !value.trim()) {
                updateFieldError('username', 'usernameRequired');
            } else if (name === 'password' && !value) {
                updateFieldError('password', 'passwordRequired');
            }
        },
        [updateFieldError]
    );

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            // Validate all fields before submission
            if (!validateAllFields()) {
                return;
            }

            setIsPending(true);
            try {
                const response: AxiosResponse<AuthResponseData> = await axios.post(
                    TOKEN_API_URL,
                    formData
                );
               
                saveDate(response.data);
                navigate(-1);
                
            } catch (error) {
                const errorDescription = getErrorDescription(
                    error,
                    'Invalid username or password. Please try again.'
                );
                console.error('Sign in error:', errorDescription);
                setErrorMessage(errorDescription);
            } finally {
                setIsPending(false);
            }
        },
        [formData, saveDate, navigate, validateAllFields, axios]
    );

    return {
        formData,
        errorMessage,
        isPending,
        showPassword,
        fieldErrors,
        getFieldError: (fieldName: string) =>
            getValidationFieldError(fieldErrors, fieldName),
        togglePasswordVisibility,
        handleInputChange,
        handleBlur,
        handleSubmit
    };
};
