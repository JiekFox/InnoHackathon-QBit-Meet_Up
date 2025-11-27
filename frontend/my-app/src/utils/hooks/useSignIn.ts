import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { AxiosResponse } from 'axios';
import { TOKEN_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router';
import { AuthResponseData } from '../../constant/types';
import { useAxiosWithAuth } from './useAxiosWithAuth';

interface UseSignInReturn {
    formData: SignInFormData;
    errorMessage: string;
    isPending: boolean;
    showPassword: boolean;
    togglePasswordVisibility: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    const { saveDate } = useAuth();
    const navigate = useNavigate();
    const axios = useAxiosWithAuth();

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

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
                    TOKEN_API_URL,
                    formData
                );
                console.log(response.data);
                saveDate(response.data);
                navigate('/');
            } catch (error) {
                console.log(error);
                setErrorMessage('Invalid username or password. Please try again.');
            } finally {
                setIsPending(false);
            }
        },
        [formData, saveDate, navigate]
    );

    return {
        formData,
        errorMessage,
        isPending,
        showPassword,
        togglePasswordVisibility,
        handleInputChange,
        handleSubmit
    };
};
