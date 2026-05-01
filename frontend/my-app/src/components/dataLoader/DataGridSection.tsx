import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import { useDataGrid } from './useDataGrid';
import { MEETUP_DETAILS } from '../../constant/router';
import MeetupCard from '../MeetupCard';
import { Meetup, ParamsForFetch } from '../../constant/types';
import { useTranslation } from 'react-i18next';
import { TAGS_API_URL } from '../../constant/apiURL';
import { useAxiosWithAuth } from '../../utils/hooks/useAxiosWithAuth';
import { Tag } from '../TagSelector';
import { useState, useEffect } from 'react';
import { FilterData } from '../FilterPanel';

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
    const axios = useAxiosWithAuth();
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [tagsLoading, setTagsLoading] = useState(true);

    const {
        items,
        currentPage,
        totalPages,
        loading,
        error,
        searchQuery,
        setCurrentPage,
        handleSearchChange,
        handleFiltersApply,
        setLoading,
        setItems,
        setTotalPages
    } = useDataGrid<Meetup>(fetchFunction);

    // Fetch tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get(TAGS_API_URL);
                setAllTags(response.data);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                setAllTags([]);
            } finally {
                setTagsLoading(false);
            }
        };

        fetchTags();
    }, []);

    const handleApplyFilters = (filters: FilterData) => {
        const tagIds = filters.selectedTags.map(tag => tag.id);
        handleFiltersApply(
            filters.startDate,
            filters.endDate,
            tagIds,
            filters.showOldMeetups
        );
    };

    const handleClearFilters = () => {
        handleFiltersApply('', '', [], false);
    };
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
                onFiltersApply={handleApplyFilters}
                onClearFilters={handleClearFilters}
                allTags={allTags}
                tagsLoading={tagsLoading}
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
                            location={meetup?.location}
                            tags={meetup?.tags}
                            duration={meetup?.duration}
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
