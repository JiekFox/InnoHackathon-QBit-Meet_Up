import { useState, useEffect, useMemo, useCallback } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { MEETINGS_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router';
import { SIGN_IN } from '../../constant/router';
import { Meetup } from '../../constant/types';
import { useAxiosWithAuth } from './useAxiosWithAuth';

interface UseMeetupDetailsReturn {
    meetup: Meetup | null;
    loading: boolean;
    error: string | null;
    isFavorite: boolean | null;
    handleSignForMeeting: () => Promise<void>;
    handleUnsubscribe: () => Promise<void>;
    formattedDate: string;
}

export const useMeetupDetails = (id: string | undefined): UseMeetupDetailsReturn => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const axios = useAxiosWithAuth();
    const [meetup, setMeetup] = useState<Meetup | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchMeetupData = async () => {
            try {
                const response = await axios.get<Meetup>(
                    `${MEETINGS_API_URL}${id}/`
                );
                setMeetup(response.data);
            } catch (err) {
                const axiosErr = err as AxiosError;
                setError((axiosErr.response?.data as string) || axiosErr.message);
            } finally {
                setLoading(false);
            }
        };

        const checkIsFavorite = async () => {
            if (!token) return;

            try {
                const response: AxiosResponse<{ message: boolean }> =
                    await axios.get(`${MEETINGS_API_URL}${id}/is_subscribed/`);

                setIsFavorite(response.data.message);
            } catch (err) {
                console.error(
                    'Error checking subscription:',
                    (err as Error).message
                );
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
            await axios.post(`${MEETINGS_API_URL}${id}/subscribe/`, {});
            window.location.reload();
        } catch (error) {
            console.error(
                'Error signing for meeting:',
                (error as AxiosError).message
            );
        }
    }, [token, id, navigate]);

    const handleUnsubscribe = useCallback(async () => {
        if (!token) {
            navigate(SIGN_IN);
            return;
        }

        try {
            await axios.delete(`${MEETINGS_API_URL}${id}/unsubscribe/`);
            window.location.reload();
        } catch (error) {
            console.error(
                'Error unsubscribing from meeting:',
                (error as AxiosError).message
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
