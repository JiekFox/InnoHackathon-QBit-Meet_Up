import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { MEETINGS_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { giveConfig } from '../giveConfig';
import { useNavigate } from 'react-router';
import { SIGN_IN } from '../../constant/router';
export const useMeetupDetails = id => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [meetup, setMeetup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(null);

    useEffect(() => {
        const fetchMeetupData = async () => {
            try {
                const response = await axios.get(`${MEETINGS_API_URL}${id}/`);
                setMeetup(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data || err.message);
                setLoading(false);
            }
        };

        const checkIsFavorite = async () => {
            if (!token) return;

            try {
                const response = await axios.get(
                    `${MEETINGS_API_URL}${id}/is_subscribed/`,
                    giveConfig(token)
                );
                setIsFavorite(response.data?.message || false);
            } catch (err) {
                console.error('Error checking subscription:', err.message);
            }
        };

        fetchMeetupData();
        if (token) {
            checkIsFavorite();
        }
    }, [id, token]);

    const handleSignForMeeting = useCallback(async () => {
        if (!token) {
            navigate(SIGN_IN);
            return;
        }

        try {
            await axios.post(
                `${MEETINGS_API_URL}${id}/subscribe/`,
                {},
                giveConfig(token)
            );

            window.location.reload();
        } catch (error) {
            console.error(
                'Error signing for meeting:',
                error.response?.data || error.message
            );
        }
    }, [token, id, navigate]);

    const handleUnsubscribe = useCallback(async () => {
        if (!token) {
            navigate(SIGN_IN);
            return;
        }

        try {
            await axios.delete(
                `${MEETINGS_API_URL}${id}/unsubscribe/`,
                giveConfig(token)
            );

            window.location.reload();
        } catch (error) {
            console.error(
                'Error unsubscribing from meeting:',
                error.response?.data || error.message
            );
        }
    }, [token, id, navigate]);

    const formattedDate = useMemo(() => {
        return meetup ? new Date(meetup.datetime_beg).toString() : 'Not specified';
    }, [meetup]);

    return {
        meetup,
        loading,
        error,
        handleSignForMeeting,
        handleUnsubscribe,
        isFavorite,
        formattedDate
    };
};
