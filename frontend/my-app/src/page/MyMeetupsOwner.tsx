import { useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { GPT_URL, USER_API_URL } from '../constant/apiURL';
import {
    AIControls,
    DataGridSection
} from '../components/dataLoader/DataGridSection';
import IntroSection from '../components/IntroSection';
import { Meetup, ParamsForFetch } from '../constant/types';
import { paramsToQuery } from '../utils/paramsToQuery';
import { useAxiosWithAuth } from '../utils/hooks/useAxiosWithAuth';

export default function MyMeetups() {
    const { userID } = useAuth();
    const axios = useAxiosWithAuth();

    const fetchMeetups = useCallback(async (params: ParamsForFetch) => {
        const query = paramsToQuery(params);
        console.log(`${USER_API_URL}${userID}/meetings_owned/?${query}`);
        const response = await axios.get(
            `${USER_API_URL}${userID}/meetings_owned/?${query}`
        );
        return {
            results: response.data.results.map((item: any) => ({
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

        if (!searchQuery || !searchQuery.trim()) {
            console.log('Search query is empty');
            return;
        }

        setLoading(true);

        try {
            const meetupsResponse = await axios.get(
                `${USER_API_URL}${userID}/meetings_owned/?${searchQuery}`
            );
            const meetups: Meetup[] = meetupsResponse.data?.results || [];

            const formattedMeetups = meetups
                .map(m => `ID:${m.id} (Title: ${m.title}, Desc: ${m.description})`)
                .join('; ');

            const gptPrompt = `
                Тебе дана строка поиска: "${searchQuery}". 
                И список существующих митапов: ${formattedMeetups}. 
                Твоя задача: найти митапы, которые по смыслу связаны с поисковым запросом.
                Дай ответ СТРОГО в одном из двух форматов:
                1. Если нашел: "Success, id:[1, 2, 3]" (где в скобках ID подходящих митапов).
                2. Если не нашел: "Fail, nothing interesting was found".
                Ничего лишнего не пиши.
            `;
            console.log(gptPrompt);
            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptPrompt },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const gptMessage =
                gptResponse.data?.choices?.[0]?.message?.content || '';

            if (gptMessage.startsWith('Success')) {
                const match = gptMessage.match(/\[.*?\]/);

                if (match) {
                    const ids: number[] = JSON.parse(match[0]);

                    const filtered = meetups.filter(m => ids.includes(m.id));

                    setItems(filtered);
                    setTotalPages(1);
                } else {
                    console.error('Failed to parse IDs from AI response');
                }
            } else {
                console.log('AI did not find relevant meetups.');
                setItems([]);
            }
        } catch (error) {
            console.error('Error in AI search:', error);
            alert('Failed to perform AI search. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <IntroSection
                styleClass="intro"
                title="Your Created Meetups"
                description="These are the meetups you've created. Manage, edit or delete your events as needed."
            />

            <DataGridSection<Meetup>
                fetchFunction={fetchMeetups}
                onSearchByAI={handleSearchByAI}
            />
        </>
    );
}
