import { useState, useEffect, useMemo, useCallback } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { MEETINGS_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router';
import { SIGN_IN } from '../../constant/router';
import { Meetup } from '../../constant/types';
import { useAxiosWithAuth } from './useAxiosWithAuth';
import { formatDate } from '../formatDate';
import i18n from '../../i18n';

interface UseMeetupDetailsReturn {
    meetup: Meetup | null;
    loading: boolean;
    pending: boolean;
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
    const [pending, setPending] = useState<boolean>(false);
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
                const data = axiosErr.response?.data;
                if (data) {
                    setError(
                        typeof data === 'string'
                            ? data
                            : (data as any).detail ||
                                  (data as any).message ||
                                  JSON.stringify(data)
                    );
                } else {
                    setError(axiosErr.message);
                }
            } finally {
                setLoading(false);
            }
        };

        const checkIsFavorite = async () => {
            if (!token) return;
            setPending(true);
            try {
                const response: AxiosResponse<{ message: boolean }> =
                    await axios.get(`${MEETINGS_API_URL}${id}/is_subscribed/`);

                setIsFavorite(response.data.message);
            } catch (err) {
                console.error(
                    'Error checking subscription:',
                    (err as Error).message
                );
            } finally {
                setPending(false);
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
        setPending(true);
        try {
            await axios.post(`${MEETINGS_API_URL}${id}/subscribe/`, {});

            setIsFavorite(true);
            setMeetup(prev =>
                prev
                    ? { ...prev, attendees_count: (prev.attendees_count || 0) + 1 }
                    : null
            );
        } catch (error) {
            console.error(
                'Error signing for meeting:',
                (error as AxiosError).message
            );
            const axiosErr = error as AxiosError;
            const data = axiosErr.response?.data;
            if (data) {
                setError(
                    typeof data === 'string'
                        ? data
                        : (data as any).detail ||
                              (data as any).message ||
                              JSON.stringify(data)
                );
            } else {
                setError('Failed to subscribe');
            }
        } finally {
            setPending(false);
        }
    }, [token, navigate, axios, id]);

    const handleUnsubscribe = useCallback(async () => {
        if (!token) {
            navigate(SIGN_IN);
            return;
        }
        setPending(true);
        try {
            await axios.delete(`${MEETINGS_API_URL}${id}/unsubscribe/`);

            setIsFavorite(false);
            setMeetup(prev =>
                prev
                    ? {
                          ...prev,
                          attendees_count: Math.max(
                              (prev.attendees_count || 0) - 1,
                              0
                          )
                      }
                    : null
            );
        } catch (error) {
            console.error(
                'Error unsubscribing from meeting:',
                (error as AxiosError).message
            );
            const axiosErr = error as AxiosError;
            const data = axiosErr.response?.data;
            if (data) {
                setError(
                    typeof data === 'string'
                        ? data
                        : (data as any).detail ||
                              (data as any).message ||
                              JSON.stringify(data)
                );
            } else {
                setError('Failed to unsubscribe');
            }
        } finally {
            setPending(false);
        }
    }, [token, id, navigate, axios]);

    const formattedDate = useMemo(() => {
        return meetup ? formatDate(meetup.datetime_beg) : 'Not specified';
    }, [meetup, i18n.language]);

    return {
        meetup,
        loading,
        pending,
        error,
        handleSignForMeeting,
        handleUnsubscribe,
        isFavorite,
        formattedDate
    };
};
