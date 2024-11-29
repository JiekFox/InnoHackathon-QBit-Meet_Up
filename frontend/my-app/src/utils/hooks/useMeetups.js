import { useState, useEffect, useCallback, useMemo } from 'react';
import useFetchMeetings from '../../api/useFetchMeetings';
import { BASE_API_URL, GPT_URL, MEETINGS_API_URL } from '../../constant/apiURL';
import axios from 'axios';
import { useAuth } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { SIGN_IN } from '../../constant/router';

const ITEMS_PER_PAGE = 12;

export const useMeetups = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [meetups, setMeetups] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

    const navigate = useNavigate();
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

    const { data, loading, error, setLoading } = useFetchMeetings(buildApiUrl());

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

        return meetups;
    }, [meetups, searchQuery]);

    const BACKEND_URL = BASE_API_URL;
    function handleSearchByAI() {
        handleSearchByAIF(searchQuery);
    }
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
    };

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
        handleRecommendedByAI,
        handleSearchByAI
    };
};
