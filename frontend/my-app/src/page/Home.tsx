import IntroSection from '../components/IntroSection';
import { MEETINGS_API_URL } from '../constant/apiURL';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

import {
    DataGridSection,
    AIControls
} from '../components/dataLoader/DataGridSection';

import { SIGN_IN } from '../constant/router';
import { BASE_API_URL /*, MEETINGS_API_URL */ } from '../constant/apiURL';
import { Meetup, ParamsForFetch } from '../constant/types';
import { paramsToQuery } from '../utils/paramsToQuery';
import { useAxiosWithAuth } from '../utils/hooks/useAxiosWithAuth';

export default function Home() {
    const navigate = useNavigate();
    const { userID } = useAuth();
    const axios = useAxiosWithAuth();
    const fetchMeetups = React.useCallback(async (params: ParamsForFetch) => {
        const query = paramsToQuery(params);
        console.log('fetch home');
        const response = await axios.get(`${MEETINGS_API_URL}?${query}`);
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
            const gptMessage = 'Success, id:[76, 69, 38]'; // Mock response
            if (gptMessage.startsWith('Success')) {
                const ids = JSON.parse(gptMessage.match(/\[.*?\]/)?.[0] || '[]');
                console.log(ids);
                console.log(meetups);
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
                title="Public MeetUps!"
                description="Here you can find new Meetups and subscribe to them!"
                isButton={true}
            />
            {/*<MeetupsSection />*/}
            {/*<DataLoader fetchFunction={fetchWithToken} />*/}
            <DataGridSection
                fetchFunction={fetchMeetups}
                onSearchByAI={handleSearchByAI}
                onRecommendByAI={handleRecommendedByAI}
            />
        </>
    );

    /*
    const handleSearchByAIF = async search => {
        try {
            setLoading(true);

            const page = 1;
            const pageSize = 50;
            const meetupsResponse = await axios.get(
                `${BACKEND_URL}meetings/?page=${page}&page_size=${pageSize}`
            );
            const meetups = meetupsResponse.data?.results || [];

            const formattedMeetups = meetups
                .map(meetup => `${meetup.id}+${meetup.description}`)
                .join(', ');

            const gptPrompt = `Тебе дана строка поиска: ${search}. И список существующих митапов в формате ${formattedMeetups}. Твоя задача: подумать, какие митапы, связаны с словами из поиска, и дать мне ответ строго в таком формате "Success, id:[массив из id, которые ты считаешь, были бы интересны пользователю]" Если ты не смог найти ничего подходящего, возвращаешь мне строго такой ответ: "Fail, 'nothing interesting was found'"`;

            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptPrompt },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            const gptMessage = gptResponse.data.choices[0].message.content;

            if (gptMessage.startsWith('Success')) {
                const ids = JSON.parse(gptMessage.match(/\[.*?\]/)[0]);
                const filteredMeetupsV2 = meetups.filter(meetup =>
                    ids.includes(meetup.id)
                );

                setMeetups(filteredMeetupsV2);
                setTotalPages(1);
                setCurrentPage(1);
            } else {
                console.error('GPT returned a Fail response or no relevant IDs.');
            }
        } catch (error) {
            console.error(
                'Error occurred while processing AI recommendation:',
                error
            );
        } finally {
            setLoading(false);
        }
    };
    const handleRecommendedByAI = async () => {
        try {
            if (!userID) {
                console.error('User ID not set. Please login first.');
                navigate(SIGN_IN);
                return;
            }
            setLoading(true);

            const userResponse = await axios.get(`${BACKEND_URL}users/${userID}/`, {
                headers: { Authorization: `Bearer ${token.access}` }
            });

            const userDescription =
                userResponse.data?.user_description || 'No description provided';

            const page = 1;
            const pageSize = 50;
            const meetupsResponse = await axios.get(
                `${BACKEND_URL}meetings/?page=${page}&page_size=${pageSize}`,
                {
                    headers: { Authorization: `Bearer ${token.access}` }
                }
            );
            const meetups = meetupsResponse.data?.results || [];

            const formattedMeetups = meetups
                .map(meetup => `${meetup.id}+${meetup.description}`)
                .join(', ');

            const gptPrompt = `Тебе дано описание интересов пользователя: ${userDescription}. И список существующих митапов в формате ${formattedMeetups}. Твоя задача: подумать, какие митапы, исходя из их описания, были бы интересны пользователю, и дать мне ответ строго в таком формате "Success, id:[массив из id, которые ты считаешь, были бы интересны пользователю]" Если ты не смог найти ничего подходящего, возвращаешь мне строго такой ответ: "Fail, 'nothing interesting was found'"`;

            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptPrompt },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            const gptMessage = gptResponse.data.choices[0].message.content;

            if (gptMessage.startsWith('Success')) {
                const ids = JSON.parse(gptMessage.match(/\[.*?\]/)[0]);

                const filteredMeetupsV2 = meetups.filter(meetup =>
                    ids.includes(meetup.id)
                );

                setMeetups(filteredMeetupsV2);
                setTotalPages(1);
                setCurrentPage(1);
            } else {
                console.error('GPT returned a Fail response or no relevant IDs.');
            }
        } catch (error) {
            console.error(
                'Error occurred while processing AI recommendation:',
                error
            );
        } finally {
            setLoading(false);
        }
    };*/
}
