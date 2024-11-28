import React from 'react';
import FilterBar from '../components/FilterBar';
import MeetupCard from '../components/MeetupCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import { useUserMeetups } from '../utils/hooks/useUserMeetups';

export default function MyMeetupsSubscriber() {
    const {
        paginatedMeetups,
        currentPage,
        totalPages,
        loading,
        error,
        setCurrentPage,
        handleSearchChange,
        handleDateFilter
    } = useUserMeetups('meetings_signed');

    return (
        <section className="home">
            <FilterBar
                onSearchChange={handleSearchChange}
                onDateFilter={handleDateFilter}
            />

            <div className="meetup-grid">
                {loading ? (
                    <Loader />
                ) : error ? (
                    <h1>Error: {error}</h1>
                ) : paginatedMeetups.length > 0 ? (
                    paginatedMeetups.map(meetup => (
                        <MeetupCard key={meetup.id} {...meetup} />
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
    );
}
