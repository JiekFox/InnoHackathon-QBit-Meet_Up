import { useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SIGN_IN } from '../constant/router';
import axios from 'axios';
import { BASE_API_URL, USER_API_URL } from '../constant/apiURL';
import {
    AIControls,
    DataGridSection
} from '../components/dataLoader/DataGridSection';
import IntroSection from '../components/home/IntroSection';
import { Meetup, ParamsForFetch } from '../constant/types';
import { giveConfig } from '../utils/giveConfig';
import { paramsToQuery } from '../utils/paramsToQuery';

export default function MyMeetupsSubscriber() {
    const navigate = useNavigate();
    const { userID, token } = useAuth();
    // 1. Определяем ОСНОВНУЮ функцию для получения данных
    const fetchMeetups = useCallback(async (params: ParamsForFetch) => {
        const query = paramsToQuery(params);
        console.log(fetch);
        const config = giveConfig(token);
        if (!config) return { results: [], count: 0 };
        const response = await axios.get(
            `${USER_API_URL}${userID}/meetings_signed/?${query}`,
            config
        );
        return {
            results: response.data.results.map((item: any) => ({
                // Маппинг данных
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.image,
                dateTime: item.datetime_beg
            })),
            count: response.data.count
        };
    }, []);
    const handleSearchByAI = async (controls: AIControls<Meetup>) => {
        const { setLoading, setItems, setTotalPages, searchQuery } = controls;
        // ... (вся логика из вашей handleSearchByAIF, используя searchQuery)
        // Пример:
        setLoading(true);
        try {
            const meetupsResponse = await axios.get(
                `${BASE_API_URL}meetings/?page_size=50`
            );
            const meetups = meetupsResponse.data?.results || [];
            // ... остальная логика с gptPrompt ...
            const gptMessage = 'Success, id:[1, 2, 3]'; // Mock response
            if (gptMessage.startsWith('Success')) {
                const ids = JSON.parse(gptMessage.match(/\[.*?\]/)?.[0] || '[]');
                const filtered = meetups.filter((m: Meetup) => ids.includes(m.id));
                setItems(filtered);
                setTotalPages(1); // AI поиск не использует пагинацию
            }
        } catch (error) {
            console.error('Error in AI search:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecommendedByAI = async (controls: AIControls<Meetup>) => {
        const { setLoading, setItems, setTotalPages } = controls;
        if (!userID) {
            navigate(SIGN_IN);
            return;
        }
        // ... (вся логика из вашей handleRecommendedByAI)
        setLoading(true);
        try {
            // ... все ваши axios запросы и логика с GPT ...
            setItems([]); // Установить результат
            setTotalPages(1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <IntroSection
                styleClass="intro"
                title="Meetups You're Attending"
                description="These are the events you have subscribed to. Stay updated and get ready to join the discussions!"
            />

            <DataGridSection<Meetup>
                fetchFunction={fetchMeetups}
                onSearchByAI={handleSearchByAI}
                onRecommendByAI={handleRecommendedByAI}
            />
        </>
    );
}
