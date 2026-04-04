import { useState, useEffect } from 'react';
import { MEETINGS_API_URL } from '../../constant/apiURL';
import { useAxiosWithAuth } from './useAxiosWithAuth';
import { getErrorDescription } from '../index';

export interface Attendee {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    photo: string;
    user_description: string;
}

interface AttendeesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Attendee[];
}

interface UseAttendeesReturn {
    attendees: Attendee[];
    loading: boolean;
    error: string | null;
}

export const useAttendees = (meetupId: string | undefined): UseAttendeesReturn => {
    const axios = useAxiosWithAuth();
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttendees = async () => {
            if (!meetupId) return;

            setLoading(true);
            try {
                const response = await axios.get<AttendeesResponse>(
                    `${MEETINGS_API_URL}${meetupId}/attendees/`
                );
                setAttendees(response.data.results);
                setError(null);
            } catch (err) {
                const errorDescription = getErrorDescription(
                    err,
                    'Failed to fetch attendees'
                );
                console.error('Error fetching attendees:', errorDescription);
                setError(errorDescription);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendees();
    }, [meetupId]);

    return {
        attendees,
        loading,
        error
    };
};
