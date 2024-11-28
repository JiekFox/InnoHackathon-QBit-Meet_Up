import Pagination from '../components/Pagination';
import React from 'react';
import { useUserMeetups } from '../utils/hooks/useUserMeetups';
import FilterBar from '../components/FilterBar';
import Loader from '../components/Loader';
import MeetupCard from '../components/MeetupCard';

export default function MyMeetups() {
    const {
        paginatedMeetups,
        currentPage,
        totalPages,
        loading,
        error,
        setCurrentPage,
        handleSearchChange,
        handleDateFilter
    } = useUserMeetups('meetings_owned');

    console.log(handleDateFilter);
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
