import { useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SIGN_IN } from '../constant/router';
import { BASE_API_URL, USER_API_URL } from '../constant/apiURL';
import {
    AIControls,
    DataGridSection
} from '../components/dataLoader/DataGridSection';
import IntroSection from '../components/IntroSection';
import { Meetup, ParamsForFetch } from '../constant/types';
import { paramsToQuery } from '../utils/paramsToQuery';
import { useAxiosWithAuth } from '../utils/hooks/useAxiosWithAuth';

export default function MyMeetups() {
    const navigate = useNavigate();
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

        setLoading(true);
        try {
            const meetupsResponse = await axios.get(
                `${BASE_API_URL}meetings/?page_size=50`
            );
            const meetups = meetupsResponse.data?.results || [];

            const gptMessage = 'Success, id:[81, 69, 85]';
            if (gptMessage.startsWith('Success')) {
                const ids = JSON.parse(gptMessage.match(/\[.*?\]/)?.[0] || '[]');
                const filtered = meetups.filter((m: Meetup) => ids.includes(m.id));
                setItems(filtered);
                setTotalPages(1);
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
        // TODO
        setLoading(true);
        try {
            setItems([]);
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
                title="Your Created Meetups"
                description="These are the meetups you've created. Manage, edit or delete your events as needed."
            />

            <DataGridSection<Meetup>
                fetchFunction={fetchMeetups}
                onSearchByAI={handleSearchByAI}
                onRecommendByAI={handleRecommendedByAI}
            />
        </>
    );
    /*const { token } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!token) {
            navigate(SIGN_IN);
        }
    }, []);
    const {
        paginatedMeetups,
        currentPage,
        totalPages,
        loading,
        error,
        setCurrentPage,
        handleSearchChange
    } = useUserMeetups('meetings_owned');
*/
    /*return (
        <section className="home">
            <FilterBar onSearchChange={handleSearchChange} />

            <div className="meetup-grid">
                {loading ? (
                    <Loader />
                ) : error ? (
                    <h1>Error: {error}</h1>
                ) : paginatedMeetups.length > 0 ? (
                    paginatedMeetups.map(meetup => (
                        <MeetupCard
                            key={meetup.id}
                            to={`${MEETUP_DETAILS}/${meetup.id}`}
                            {...meetup}
                        />
                    ))
                ) : (
                    <h2>No meetups found.</h2>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </section>
    );*/
}
