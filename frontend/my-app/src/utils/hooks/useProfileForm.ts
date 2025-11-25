import { useCallback, useEffect, useMemo, useState } from 'react';
import { USER_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useAxiosWithAuth } from './useAxiosWithAuth';
import { ProfileFormData } from '../../constant/types';

export interface ProfileFormErrors {
    [key: string]: string[];
}

const baseValues: ProfileFormData = {
    name: '',
    surname: '',
    email: '',
    about: '',
    username: '',
    tg_id: '',
    teams_id: '',
    photo: null
};

export const useProfileForm = () => {
    const { token, userID, saveDate } = useAuth();
    const axios = useAxiosWithAuth();

    const [serverValues, setServerValues] = useState<ProfileFormData | null>(null);
    const [userValues, setUserValues] = useState<Partial<ProfileFormData>>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<ProfileFormErrors>({});
    const [loading, setLoading] = useState(false);

    // Итоговое состояние формы
    const finalValues: ProfileFormData = useMemo(() => {
        return {
            ...baseValues,
            ...serverValues,
            ...userValues
        };
    }, [serverValues, userValues]);

    // Загружаем профиль с сервера
    const fetchUserData = useCallback(async () => {
        if (!token?.access) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${USER_API_URL}${userID}/`);

            setServerValues({
                name: data.first_name || '',
                surname: data.last_name || '',
                email: data.email || '',
                about: data.user_description || '',
                username: data.username || '',
                tg_id: data.tg_id || '',
                teams_id: data.teams_id || '',
                photo: null
            });

            if (data.photo) setPhotoPreview(data.photo);
        } finally {
            setLoading(false);
        }
    }, [token, userID]);

    useEffect(() => {
        if (token?.access) fetchUserData();
    }, [fetchUserData, token]);

    // Текстовые поля → userValues
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setUserValues(prev => ({ ...prev, [name]: value }));
    };

    // Фото → userValues
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUserValues(prev => ({ ...prev, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
    };

    // PATCH — отправляем только изменённые данные
    const handleSave = useCallback(async () => {
        if (!token?.access) return;

        const formDataToSend = new FormData();
        setLoading(true);
        Object.entries(userValues).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formDataToSend.append(
                    key === 'name'
                        ? 'first_name'
                        : key === 'surname'
                          ? 'last_name'
                          : key === 'about'
                            ? 'user_description'
                            : key,
                    value as any
                );
            }
        });

        try {
            console.log([...formDataToSend]);
            const response = await axios.patch(
                `${USER_API_URL}${userID}/`,
                formDataToSend
            );
            console.log(response);
            // saveDate(response.data);
            setErrors({});
            alert('Profile updated successfully!');
        } catch (error: any) {
            if (error.response?.data) setErrors(error.response.data);
            else console.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [userValues, token, userID]);

    return {
        finalValues,
        userValues,
        photoPreview,
        errors,
        loading,
        handleChange,
        handlePhotoUpload,
        handleSave
    };
};
