import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { MEETINGS_API_URL } from '../../constant/apiURL';
import { MEETUP_DETAILS, SIGN_IN } from '../../constant/router';
import { giveConfig } from '../giveConfig';
import { useAuth } from '../AuthContext';

export const useMeetupForm = () => {
    const { token, userID } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        datetime_beg: '',
        link: '',
        description: '',
        image: null
    });
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);

    const handleChange = useCallback(e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleImageUpload = useCallback(e => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
        }
    }, []);

    const handleSubmit = useCallback(
        async e => {
            e.preventDefault();

            if (!token) {
                navigate(SIGN_IN);
                return;
            }

            const meetingData = new FormData();
            meetingData.append('title', formData.title);
            meetingData.append('author_id', userID);
            meetingData.append('datetime_beg', formData.datetime_beg);
            meetingData.append('link', formData.link);
            meetingData.append('description', formData.description);
            if (formData.image) {
                meetingData.append('image', formData.image);
            }

            try {
                setIsPending(true);
                const response = await axios.post(
                    MEETINGS_API_URL,
                    meetingData,
                    giveConfig(token)
                );
                navigate(`${MEETUP_DETAILS}/${response.data.id}`);
            } catch (error) {
                console.error(
                    'Error creating meeting:',
                    error.response?.data || error.message
                );
                setError(error.response?.data || 'An error occurred');
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
