import { useState, useCallback } from 'react';
import axios from 'axios';
import { BASE_API_URL, GPT_URL } from '../constant/apiURL';

export const useAIRecommendedMeetups = (userID, token) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recommendedMeetups, setRecommendedMeetups] = useState([]);

    const handleRecommendedByAI = useCallback(async () => {
        if (!userID) {
            console.error('User ID not set. Please login first.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const BACKEND_URL = BASE_API_URL;

            // Шаг 1: Получаем описание пользователя
            const userResponse = await axios.get(`${BACKEND_URL}users/${userID}/`, {
                headers: { Authorization: `Bearer ${token.access}` }
            });
            const userDescription =
                userResponse.data?.user_description || 'No description provided';

            // Шаг 2: Получаем 50 последних митапов
            const page = 1;
            const pageSize = 50;
            const meetupsResponse = await axios.get(
                `${BACKEND_URL}meetings/?page=${page}&page_size=${pageSize}`,
                {
                    headers: { Authorization: `Bearer ${token.access}` }
                }
            );
            const meetups = meetupsResponse.data?.results || [];

            // Формируем данные для GPT
            const formattedMeetups = meetups
                .map(meetup => `${meetup.id}+${meetup.description}`)
                .join(', ');

            const gptPrompt = `Тебе дано описание интересов пользователя: ${userDescription}. И список существующих митапов в формате ${formattedMeetups}. Твоя задача: подумать, какие митапы, исходя из их описания, были бы интересны пользователю, и дать мне ответ строго в таком формате "Success, id:[массив из id, которые ты считаешь, были бы интересны пользователю]" Если ты не смог найти ничего подходящего, возвращаешь мне строго такой ответ: "Fail, 'nothing interesting was found'"`;

            // Шаг 3: Отправляем запрос к GPT API
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
                const filteredMeetups = meetups.filter(meetup =>
                    ids.includes(meetup.id)
                );

                setRecommendedMeetups(filteredMeetups);
            } else {
                console.error('GPT returned a Fail response or no relevant IDs.');
                setRecommendedMeetups([]);
            }
        } catch (error) {
            console.error(
                'Error occurred while processing AI recommendation:',
                error
            );
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [userID, token]);

    return { recommendedMeetups, loading, error, handleRecommendedByAI };
};
