import { useState, useCallback } from 'react';
import axios from 'axios';
import { TOKEN_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router';

export const useSignIn = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { saveDate } = useAuth();
    const navigate = useNavigate();

    const togglePasswordVisibility = useCallback(
        () => setShowPassword(prev => !prev),
        []
    );
    const handleInputChange = useCallback(e => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        async e => {
            e.preventDefault();
            setIsPending(true);
            try {
                const response = await axios.post(TOKEN_API_URL, formData);
                saveDate(response.data);
                navigate('/');
            } catch (error) {
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
