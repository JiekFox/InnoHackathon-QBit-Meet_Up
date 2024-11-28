import React, { useEffect } from "react";
import FilterBar from '../FilterBar';
import MeetupCard from '../MeetupCard';
import Pagination from '../Pagination';
import { MEETUP_DETAILS } from '../../constant/router';
import { useMeetups } from '../../utils/hooks/useMeetups';
import Loader from '../Loader';

export default function MeetupsSection() {
    const {
        filteredMeetups,
        currentPage,
        totalPages,
        loading,
        error,
        setCurrentPage,
        handleSearchChange,
        handleDateFilter,
        handleRecommendedByAI, // Добавляем функцию из useMeetups
    } = useMeetups();

    useEffect(() => {
        console.log('Filtered meetups updated:', filteredMeetups);
    }, [filteredMeetups]);

    console.log(filteredMeetups)
    return (
        <section className="home">
            <FilterBar
                onSearchChange={handleSearchChange}
                onDateFilter={handleDateFilter}
                onRecommendByAI={handleRecommendedByAI} // Передаем функцию в FilterBar
                isLoading={loading} // Передаем состояние загрузки
            />

            <div className="meetup-grid">
                {loading ? (
                    <Loader />
                ) : error ? (
                    <h1>Error: {error.message}</h1>
                ) : (
                    filteredMeetups.map(meetup => (
                        <MeetupCard
                            key={meetup.id}
                            to={`${MEETUP_DETAILS}/${meetup.id}`}
                            {...meetup}
                        />
                    ))
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </section>
    );
}
