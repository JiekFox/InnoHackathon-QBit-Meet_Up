import { useState, useCallback } from 'react';
import axios from 'axios';
import { REGISTER_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router';

export const useSignUp = () => {
    const [formData, setFormData] = useState({
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
    const handleInputChange = useCallback(e => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        async e => {
            setIsPending(true);
            e.preventDefault();
            try {
                const response = await axios.post(REGISTER_API_URL, formData);

                saveDate(response.data);
                navigate('/');
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.username[0] ||
                        'Registration failed. Please try again.'
                );
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
