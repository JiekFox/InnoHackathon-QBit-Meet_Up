import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { REGISTER_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router';
import { AuthResponseData } from '../../constant/types';
import { getErrorDescription } from '../index';

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
    const { saveDate } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const togglePasswordVisibility = useCallback(
        () => setShowPassword(prev => !prev),
        []
    );

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
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
                const errorDescription = getErrorDescription(error, 'Registration failed. Please try again.');
                console.error('Registration error:', errorDescription);
                setErrorMessage(errorDescription);
            } finally {
                setIsPending(false);
            }
        },
        [formData, saveDate, navigate]
    );

    return {
        formData,
        errorMessage,
        showPassword,
        togglePasswordVisibility,
        handleInputChange,
        handleSubmit,
        isPending
    };
};
