import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { MEETINGS_API_URL } from '../../constant/apiURL';
import { MEETUP_DETAILS, SIGN_IN } from '../../constant/router';
import { giveConfig } from '../giveConfig';
import { useAuth } from '../AuthContext';
import { Config, Meetup } from '../../constant/types';

export interface MeetupFormData {
    title: string;
    datetime_beg: string;
    link: string;
    description: string;
    image: File | null;
}

export interface ApiError {
    [key: string]: string[] | string; // Для гибкости
}

export const useMeetupForm = () => {
    const { token, userID } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<MeetupFormData>({
        title: '',
        datetime_beg: '',
        link: '',
        description: '',
        image: null
    });
    const [error, setError] = useState<string | ApiError | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev): MeetupFormData => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
        }
    }, []);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!token) {
                navigate(SIGN_IN);
                return;
            }

            const meetingData = new FormData();
            meetingData.append('title', formData.title);
            meetingData.append('author_id', String(userID));
            meetingData.append('datetime_beg', formData.datetime_beg);
            meetingData.append('link', formData.link);
            meetingData.append('description', formData.description);
            if (formData.image) {
                meetingData.append('image', formData.image);
            }

            try {
                setIsPending(true);
                const config: Config | null = giveConfig(token);
                if (!config) return;
                const response: AxiosResponse<Meetup> = await axios.post(
                    MEETINGS_API_URL,
                    meetingData,
                    config
                );
                console.log(response);
                navigate(`${MEETUP_DETAILS}/${response.data.id}`);
            } catch (err) {
                const axiosError = err as AxiosError<ApiError>;
                console.error(
                    'Error creating meeting:',
                    axiosError.response?.data || axiosError.message
                );
                setError(axiosError.response?.data || 'An error occurred');
            } finally {
                setIsPending(false);
            }
        },
        [formData, token, userID, navigate]
    );

    return {
        formData,
        error,
        handleChange,
        handleImageUpload,
        handleSubmit,
        isPending
    };
};
