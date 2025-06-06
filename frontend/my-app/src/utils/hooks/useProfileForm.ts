// src/hooks/useProfileForm.ts
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { USER_API_URL } from '../../constant/apiURL';
import { giveConfig } from '../giveConfig';
import { useAuth } from '../AuthContext';
import { Config, ProfileFormData } from '../../constant/types';

export interface ProfileFormErrors {
    [key: string]: string[];
}
// ... (импорты остаются)

export const useProfileForm = () => {
    const { token, userID } = useAuth();

    const [formData, setFormData] = useState<ProfileFormData>({
        name: '',
        surname: '',
        email: '',
        about: '',
        username: '',
        tg_id: '',
        teams_id: '',
        photo: null
    });
    console.log(formData);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<ProfileFormErrors>({});
    const [loading, setLoading] = useState(false);

    const fetchUserData = useCallback(async () => {
        if (!token?.access) return;
        setLoading(true);
        try {
            const config: Config | null = giveConfig(token);
            if (!config) return;
            const { data } = await axios.get(`${USER_API_URL}${userID}/`, config);
            setFormData({
                name: data.first_name || '',
                surname: data.last_name || '',
                email: data.email || '',
                about: data.user_description || '',
                username: data.username || '',
                tg_id: data.tg_id || '',
                teams_id: data.teams_id || '',
                photo: null
            });

            // Установка превью, если фото есть
            if (data.photo) {
                setPhotoPreview(data.photo); // допустим, URL приходит напрямую
            }
        } catch (error: any) {
            console.error(error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, [token, userID]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = useCallback(async () => {
        if (!token?.access) return;

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
            const config = giveConfig(token);
            if (!config) return;
            await axios.put(`${USER_API_URL}${userID}/`, formDataToSend, config);
            setErrors({});
            alert('Profile updated successfully!');
        } catch (error: any) {
            if (error.response?.data) {
                setErrors(error.response.data);
            } else {
                console.error(error.message);
            }
        }
    }, [formData, token, userID]);

    useEffect(() => {
        if (token?.access) {
            fetchUserData();
        }
    }, [fetchUserData, token]);

    return {
        formData,
        setFormData,
        photoPreview,
        errors,
        loading,
        handleChange,
        handlePhotoUpload,
        handleSave
    };
};
