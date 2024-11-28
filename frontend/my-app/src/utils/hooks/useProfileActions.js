import { useCallback, useState } from 'react';
import axios from 'axios';
import { USER_API_URL } from '../../constant/apiURL';
import { giveConfig } from '../giveConfig';

export const useProfileActions = (
    userId,
    token,
    formData,
    setFormData,
    setErrors
) => {
    const [loading, setLoading] = useState(false);

    const fetchUserData = useCallback(async () => {
        if (!token || !token.access) return;

        setLoading(true);
        const config = giveConfig(token);

        try {
            const response = await axios.get(`${USER_API_URL}${userId}/`, config);
            const userData = response.data;
            setFormData({
                name: userData.first_name || '',
                surname: userData.last_name || '',
                email: userData.email || '',
                about: userData.user_description || '',
                username: userData.username || '',
                tg_id: userData.tg_id || '',
                teams_id: userData.teams_id || '',
                photo: userData.photo || null
            });
        } catch (error) {
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, [userId, token, setFormData]);

    const handleSave = useCallback(async () => {
        if (!token || !token.access) return;

        const config = giveConfig(token);
        const formDataToSend = new FormData();
        formDataToSend.append('first_name', formData.name);
        formDataToSend.append('last_name', formData.surname);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('user_description', formData.about);
        formDataToSend.append('username', formData.username);
        formDataToSend.append('tg_id', formData.tg_id);
        formDataToSend.append('teams_id', formData.teams_id);

        if (formData.photo) {
            formDataToSend.append('photo', formData.photo);
        }

        try {
            const response = await axios.put(
                `${USER_API_URL}${userId}/`,
                formDataToSend,
                config
            );
            console.log(response);
            setErrors({});
            alert('Profile updated successfully!');
        } catch (error) {
            console.log(error);
            if (error.response?.data) {
                setErrors(error.response.data);
            } else {
                console.error(error.message);
            }
        }
    }, [userId, token, formData, setErrors]);

    return { fetchUserData, handleSave, loading };
};
