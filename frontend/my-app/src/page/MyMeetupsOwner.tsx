import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const { userID } = useAuth();
    const axios = useAxiosWithAuth();

    const fetchMeetups = useCallback(async (params: ParamsForFetch) => {
        const query = paramsToQuery(params);
        const response = await axios.get(
            `${USER_API_URL}${userID}/meetings_owned/?${query}`
        );
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
                `${USER_API_URL}${userID}/meetings_owned/?${searchQuery}`
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
                Твоя задача: выбрать до 7 наиболее релевантных митапов.
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

            const normalizedMessage = String(gptMessage)
                .trim()
                .replace(/^"+|"+$/g, '');
            const match = normalizedMessage.match(/\[.*?\]/);
            const idsFromJson = match?.[0]
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

            const ids =
                idsFromJson.length > 0
                    ? idsFromJson
                    : (normalizedMessage.match(/\d+/g) || [])
                          .map(n => Number(n))
                          .filter(n => Number.isFinite(n));

            if (!/^success\b/i.test(normalizedMessage) || ids.length === 0) {
                setItems(fallbackLocalSearch(searchQuery));
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

    return (
        <>
            <IntroSection
                styleClass="intro"
                title={t('myMeetupsOwner.title')}
                description={t('myMeetupsOwner.description')}
            />

            <DataGridSection<Meetup>
                fetchFunction={fetchMeetups}
                onSearchByAI={handleSearchByAI}
            />
        </>
    );
}
