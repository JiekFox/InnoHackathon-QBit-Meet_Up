import IntroSection from '../components/IntroSection';
import { GPT_URL, MEETINGS_API_URL } from '../constant/apiURL';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
import MeetupPaginationSlider from '../components/Slider';

export default function Home() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userID } = useAuth();
    const axios = useAxiosWithAuth();
    const fetchMeetups = React.useCallback(async (params: ParamsForFetch) => {
        const query = paramsToQuery(params);
        console.log('fetch home');
        const response = await axios.get(`${MEETINGS_API_URL}?${query}`);
        return {
            results: response.data.results.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.image,
                dateTime: item.datetime_beg,
                tags: item.tags,
                duration: item.duration,
                ...item
            })),
            count: response.data.count
        };
    }, []);

    const handleSearchByAI = async (controls: AIControls<Meetup>) => {
        const { setLoading, setItems, setTotalPages, searchQuery } = controls;

        if (!searchQuery || !searchQuery.trim()) {
            console.log('Search query is empty');
            return;
        }

        setLoading(true);

        try {
            const meetupsResponse = await axios.get(
                `${BASE_API_URL}meetings/?page_size=50`
            );
            const meetups: Meetup[] = meetupsResponse.data?.results || [];

            const normalize = (s: string) =>
                String(s || '')
                    .toLowerCase()
                    .replace(/ё/g, 'е')
                    .replace(/[^0-9a-zа-я\s]+/gi, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

            const fallbackLocalSearch = (query: string) => {
                const q = normalize(query);
                if (!q) return meetups;
                const tokens = q.split(' ').filter(t => t.length >= 2);
                return meetups.filter(m => {
                    const hay = normalize(`${m.title} ${m.description}`);
                    if (hay.includes(q)) return true;
                    return tokens.some(t => hay.includes(t));
                });
            };

            const formattedMeetups = JSON.stringify(
                meetups.map(m => ({
                    id: m.id,
                    title: m.title,
                    description: m.description
                }))
            );

            const gptPrompt = `
            Тебе дана строка поиска: "${searchQuery}".
            Тебе дан список митапов в JSON: ${formattedMeetups}.
            Твоя задача: выбрать до 7 наиболее релевантных митапов (можно частичное совпадение по смыслу/ключевым словам).
            Верни ОДНУ строку строго в формате: Success, id:[1,2,3]
            Если ничего не подходит — верни: Success, id:[]
        `;

            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptPrompt },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const gptMessage =
                gptResponse.data?.choices?.[0]?.message?.content || '';

            const normalizedMessage = String(gptMessage).trim().replace(/^"+|"+$/g, '');
            const match = normalizedMessage.match(/\[.*?\]/);
            const idsFromJson = match?.[0] ? (() => {
                try {
                    const parsed = JSON.parse(match[0]);
                    return Array.isArray(parsed)
                        ? parsed.map((n: any) => Number(n)).filter((n: any) => Number.isFinite(n))
                        : [];
                } catch {
                    return [];
                }
            })() : [];

            const ids =
                idsFromJson.length > 0
                    ? idsFromJson
                    : (normalizedMessage.match(/\d+/g) || [])
                          .map(n => Number(n))
                          .filter(n => Number.isFinite(n));

            if (!/^success\b/i.test(normalizedMessage) || ids.length === 0) {
                const fallback = fallbackLocalSearch(searchQuery);
                setItems(fallback);
                setTotalPages(1);
                return;
            }

            const filtered = meetups.filter(m => ids.includes(m.id));
            setItems(filtered.length ? filtered : fallbackLocalSearch(searchQuery));
            setTotalPages(1);
        } catch (error) {
            console.error('Error in AI search:', error);
            alert('Failed to perform AI search. Please try again.');
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

        setLoading(true);

        try {
            const userResponse = await axios.get(`${BASE_API_URL}users/${userID}/`);

            const userDescription = userResponse.data?.user_description;

            if (!userDescription || userDescription.trim() === '') {
                alert(
                    'Please add a description to your profile so AI can recommend meetups.'
                );
                setItems([]);
                return;
            }

            const meetupsResponse = await axios.get(
                `${BASE_API_URL}meetings/?page_size=50`
            );
            const meetups: Meetup[] = meetupsResponse.data?.results || [];

            const formattedMeetups = JSON.stringify(
                meetups.map(m => ({
                    id: m.id,
                    title: m.title,
                    description: m.description
                }))
            );

            const gptPrompt = `
            Тебе дано описание интересов пользователя: "${userDescription}".
            Тебе дан список митапов в JSON: ${formattedMeetups}.
            Твоя задача: выбрать до 7 наиболее релевантных митапов.
            Верни ОДНУ строку строго в формате: Success, id:[1,2,3]
            Если ничего не подходит — верни: Success, id:[]
        `;

            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptPrompt },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (gptResponse.data?.error) {
                console.error('Server AI Error:', gptResponse.data.error);
                alert('AI service error. Please try again later.');
                return;
            }

            const gptMessage =
                gptResponse.data?.choices?.[0]?.message?.content || '';
            console.log('AI Recommendation Response:', gptMessage);

            const normalizedMessage = String(gptMessage).trim().replace(/^"+|"+$/g, '');
            const match = normalizedMessage.match(/\[.*?\]/);
            const ids: number[] = match?.[0]
                ? (() => {
                      try {
                          const parsed = JSON.parse(match[0]);
                          return Array.isArray(parsed)
                              ? parsed
                                    .map((n: any) => Number(n))
                                    .filter((n: any) => Number.isFinite(n))
                              : [];
                      } catch {
                          return [];
                      }
                  })()
                : [];

            if (!/^success\b/i.test(normalizedMessage) || ids.length === 0) {
                setItems([]);
                setTotalPages(1);
                return;
            }

            const filtered = meetups.filter(m => ids.includes(m.id));
            setItems(filtered);
            setTotalPages(1);
        } catch (e) {
            console.error('Error in AI recommendation:', e);
            alert('Failed to get recommendations.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <MeetupPaginationSlider fetchMeetups={fetchMeetups} />
            <IntroSection
                styleClass="intro"
                title={t('home.publicMeetupsTitle')}
                description={t('home.publicMeetupsDescription')}
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
