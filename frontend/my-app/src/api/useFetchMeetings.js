import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchMeetings = url => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Начало загрузки
            setError(null); // Сбрасываем ошибки

            try {
                const response = await axios.get(url);
                setData(response.data); // Успешный результат
            } catch (err) {
                setError(err.message || 'Something went wrong'); // Сохраняем ошибку
            } finally {
                setLoading(false); // Завершаем загрузку
            }
        };

        fetchData();
    }, [url]); // Зависимость от URL для динамических запросов

    return { data, loading, error };
};

export default useFetchMeetings;
