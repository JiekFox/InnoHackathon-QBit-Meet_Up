import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import { useDataGrid } from './useDataGrid';
import { MEETUP_DETAILS } from '../../constant/router';
import MeetupCard from '../MeetupCard';
import { Meetup, ParamsForFetch } from '../../constant/types';
import { useTranslation } from 'react-i18next';

interface DataGridSectionProps<T extends Meetup> {
    fetchFunction: (
        params: ParamsForFetch
    ) => Promise<{ results: Meetup[]; count: number }>;
    onRecommendByAI?: (controls: AIControls<T>) => Promise<void>;
    onSearchByAI?: (controls: AIControls<T>) => Promise<void>;
}

export interface AIControls<T> {
    setLoading: (loading: boolean) => void;
    setItems: (items: T[]) => void;
    setTotalPages: (pages: number) => void;
    searchQuery: string;
}

export function DataGridSection<T extends Meetup>({
    fetchFunction,
    onRecommendByAI,
    onSearchByAI
}: DataGridSectionProps<T>) {
    const { t } = useTranslation();
    const {
        items,
        currentPage,
        totalPages,
        loading,
        error,
        searchQuery,
        setCurrentPage,
        handleSearchChange,
        handleDateFilter,
        setLoading,
        setItems,
        setTotalPages
    } = useDataGrid<Meetup>(fetchFunction);
    if (error) console.error('Error in DataGridSection:', error);

    const aiControls: AIControls<T> = {
        setLoading,
        setItems,
        setTotalPages,
        searchQuery
    };

    return (
        <section className="home">
            <FilterBar
                onSearchChange={handleSearchChange}
                onDateFilter={handleDateFilter}
                onRecommendByAI={
                    onRecommendByAI ? () => onRecommendByAI(aiControls) : undefined
                }
                onQueryTuchUseAI={
                    onSearchByAI ? () => onSearchByAI(aiControls) : undefined
                }
            />

            <div className="meetup-grid">
                {loading ? (
                    <Loader />
                ) : error ? (
                    <h1 className="error-message">Error: {error.message}</h1>
                ) : items.length > 0 ? (
                    items.map(meetup => (
                        <MeetupCard
                            key={meetup.id}
                            to={`${MEETUP_DETAILS}/${meetup.id}`}
                            title={meetup.title}
                            description={meetup.description}
                            image={meetup.image}
                            datetime_beg={meetup?.datetime_beg}
                            dateTime={meetup?.dateTime}
                        />
                    ))
                ) : (
                    <h1>{t('dataGrid.noResults')}</h1>
                )}
            </div>

            {totalPages > 1 && (
                // && !loading
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </section>
    );
}
