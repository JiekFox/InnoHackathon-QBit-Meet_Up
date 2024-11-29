import { useState, useEffect, useCallback, useMemo } from 'react';
import useFetchMeetings from '../../api/useFetchMeetings';
import { BASE_API_URL, GPT_URL, MEETINGS_API_URL } from '../../constant/apiURL';
import axios from 'axios';
import { useAuth } from '../AuthContext.js';

const ITEMS_PER_PAGE = 12;

export const useMeetups = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [meetups, setMeetups] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
    //const [aiMeetups, setAiMeetups] = useState({});
    const { userID, token } = useAuth();
    const buildApiUrl = () => {
        let url = `${MEETINGS_API_URL}?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`;
        if (searchQuery) {
            url += `&search=${searchQuery}`;
        }
        if (dateFilter.startDate) {
            url += `&datetime_beg__gt=${dateFilter.startDate}`;
        }
        if (dateFilter.endDate) {
            url += `&datetime_beg__lt=${dateFilter.endDate}`;
        }
        return url;
    };
    //const data =[],  loading = false, error = undefined;
    const { data, loading, error } = useFetchMeetings(buildApiUrl());

    useEffect(() => {
        if (data.results) {
            setMeetups(
                data.results.map(item => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    image: item.image,
                    dateTime: item.datetime_beg
                }))
            );
            setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
            // console.log('Установлены gpt митапы 1');
        }
    }, [data]);

    const handleSearchChange = useCallback(query => {
        setSearchQuery(query);
    }, []);

    const handleDateFilter = useCallback((startDate, endDate) => {
        setDateFilter({ startDate, endDate });
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, dateFilter]);

    const filteredMeetups = useMemo(() => {
        // console.log('update filtered', meetups);
        return meetups;
    }, [meetups, searchQuery]);

    const BACKEND_URL = BASE_API_URL;
    function handleSearchByAI() {
        handleSearchByAIF(searchQuery);
    }
    const handleSearchByAIF = async search => {
        // console.log('start');
        try {
            if (!userID) {
                console.error('User ID not set. Please login first.');
                return;
            }

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

            const gptPrompt = `Тебе дана строка поиска: ${search}. И список существующих митапов в формате ${formattedMeetups}. Твоя задача: подумать, какие митапы, связаны с словами из поиска, и дать мне ответ строго в таком формате "Success, id:[массив из id, которые ты считаешь, были бы интересны пользователю]" Если ты не смог найти ничего подходящего, возвращаешь мне строго такой ответ: "Fail, 'nothing interesting was found'"`;

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
                // Извлекаем ID, которые GPT считает подходящими
                const ids = JSON.parse(gptMessage.match(/\[.*?\]/)[0]); // Преобразуем ID из строки в массив
                // console.log('Filtered IDs:', ids);

                // Фильтруем митапы по этим ID
                const filteredMeetupsV2 = meetups.filter(meetup =>
                    ids.includes(meetup.id)
                );

                // console.log('Filtered Meetups:', filteredMeetupsV2);

                //// Сохраняем отфильтрованные митапы в контексте
                //setAiMeetups({ meetups: filteredMeetups });
                // console.log('new Ai card', filteredMeetupsV2);
                setMeetups(filteredMeetupsV2);
                setTotalPages(1);
                setCurrentPage(1);
                // Проверяем состояние после обновления
                // console.log('Updated meetups state:', filteredMeetupsV2);
            } else {
                console.error('GPT returned a Fail response or no relevant IDs.');
                //setAiMeetups({ meetups: [] }); // Сбрасываем список, если ничего не найдено
            }
        } catch (error) {
            console.error(
                'Error occurred while processing AI recommendation:',
                error
            );
        }
    };
    const handleRecommendedByAI = async () => {
        try {
            if (!userID) {
                console.error('User ID not set. Please login first.');
                return;
            }

            // console.log('GPT_URL new:', GPT_URL);
            // Шаг 1: Получаем описание пользователя
            const userResponse = await axios.get(`${BACKEND_URL}users/${userID}/`, {
                headers: { Authorization: `Bearer ${token.access}` }
            });
            // console.log('User response:', userResponse.data);

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
                // Извлекаем ID, которые GPT считает подходящими
                const ids = JSON.parse(gptMessage.match(/\[.*?\]/)[0]); // Преобразуем ID из строки в массив
                // console.log('Filtered IDs:', ids);

                // Фильтруем митапы по этим ID
                const filteredMeetupsV2 = meetups.filter(meetup =>
                    ids.includes(meetup.id)
                );

                // console.log('Filtered Meetups:', filteredMeetupsV2);

                //// Сохраняем отфильтрованные митапы в контексте
                //setAiMeetups({ meetups: filteredMeetups });
                // console.log('new Ai card', filteredMeetupsV2);
                setMeetups(filteredMeetupsV2);
                setTotalPages(1);
                setCurrentPage(1);
                // Проверяем состояние после обновления
                // console.log('Updated meetups state:', filteredMeetupsV2);
            } else {
                console.error('GPT returned a Fail response or no relevant IDs.');
                //setAiMeetups({ meetups: [] }); // Сбрасываем список, если ничего не найдено
            }
        } catch (error) {
            console.error(
                'Error occurred while processing AI recommendation:',
                error
            );
        }
    };
    useEffect(() => {
        if (meetups.length > 0) {
            console.log('Meetups updated:', meetups);
        }
    }, [meetups]);

    /*useEffect(() => {


        if (aiMeetups.meetups) {
            console.log("aiMeetups:");
            console.log(aiMeetups);
            setMeetups(aiMeetups.meetups);
            console.log("Установлены gpt митапы 2");
            setTotalPages(Math.ceil(aiMeetups.meetups.count / ITEMS_PER_PAGE));

        }
    }, [aiMeetups]);*/

    return {
        searchQuery,
        filteredMeetups,
        currentPage,
        totalPages,
        loading,
        error,
        setCurrentPage,
        handleSearchChange,
        handleDateFilter,
        //setAiMeetups,
        handleRecommendedByAI,
        handleSearchByAI
    };
};
