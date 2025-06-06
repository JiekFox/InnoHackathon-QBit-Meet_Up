import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseFetchMeetingsResult<T> {
    data: T | undefined;
    loading: boolean;
    error: string | null;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

function useFetchMeetings<T = any>(url: string): UseFetchMeetingsResult<T> {
    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get<T>(url);
                console.log(response);
                setData(response.data);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error, setLoading };
}

export default useFetchMeetings;
