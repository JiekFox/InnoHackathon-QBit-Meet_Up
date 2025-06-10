// src/components/DataGridSection.tsx

import React from 'react';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import { useDataGrid } from './useDataGrid';
import { MEETUP_DETAILS } from '../../constant/router';
import MeetupCard from '../MeetupCard';
import { Meetup, ParamsForFetch } from '../../constant/types';

// Типы для пропсов
interface DataGridSectionProps<T extends Meetup> {
    fetchFunction: (
        params: ParamsForFetch
    ) => Promise<{ results: Meetup[]; count: number }>; // Берем тип из хука
    // AI функции теперь принимают объект с методами для управления состоянием
    onRecommendByAI?: (controls: AIControls<T>) => Promise<void>;
    onSearchByAI?: (controls: AIControls<T>) => Promise<void>;
}

// Тип для контролов, передаваемых в AI функции
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

    // Создаем объект с контролами для передачи в AI функции
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
                // Вызываем AI функции, передавая им контролы
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
                    <h1>Error: {error.message}</h1>
                ) : items.length > 0 ? (
                    /*interface MeetupCardProps {
                    title: string;
                    description: string;
                    image?: string;
                    dateTime?: string;
                    datetime_beg?: string;

                }*/
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
                    <h1>No results found.</h1>
                )}
            </div>

            {totalPages > 1 && !loading && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </section>
    );
}
