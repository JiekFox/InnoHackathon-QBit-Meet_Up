import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { REGISTER_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router';
import { AuthResponseData } from '../../constant/types';
import { getErrorDescription } from '../index';
import {
    ValidationError,
    getFieldError as getValidationFieldError,
    validateSignUpForm
} from '../validators';

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterErrorResponse {
    username?: string[];
    email?: string[];
    password?: string[];
    detail?: string;
}

export const useSignUp = () => {
    const [formData, setFormData] = useState<RegisterRequest>({
        username: '',
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([]);
    const { saveDate } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, setIsPending] = useState(false);

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
        const errors = validateSignUpForm(formData);
        setFieldErrors(errors);
        return errors.length === 0;
    }, [formData]);

    const togglePasswordVisibility = useCallback(
        () => setShowPassword(prev => !prev),
        []
    );

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
                updateFieldError('username', 'Username is required');
            } else if (name === 'email' && !value.trim()) {
                updateFieldError('email', 'Email is required');
            } else if (name === 'password' && !value) {
                updateFieldError('password', 'Password is required');
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
                    REGISTER_API_URL,
                    formData
                );
                console.log('registration response:', response.data);
                saveDate(response.data);
                navigate(-1);
            } catch (error) {
                const errorDescription = getErrorDescription(
                    error,
                    'Registration failed. Please try again.'
                );
                console.error('Registration error:', errorDescription);
                setErrorMessage(errorDescription);
            } finally {
                setIsPending(false);
            }
        },
        [formData, saveDate, navigate, validateAllFields]
    );

    return {
        formData,
        errorMessage,
        showPassword,
        fieldErrors,
        getFieldError: (fieldName: string) =>
            getValidationFieldError(fieldErrors, fieldName),
        togglePasswordVisibility,
        handleInputChange,
        handleBlur,
        handleSubmit,
        isPending
    };
};
