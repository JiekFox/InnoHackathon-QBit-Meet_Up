import React from 'react';
import FilterBar from '../FilterBar';
import MeetupCard from '../MeetupCard';
import Pagination from '../Pagination';
import { MEETUP_DETAILS } from '../../constant/router';
import { useMeetups } from '../../utils/hooks/useMeetups';
import Loader from '../Loader';

export default function MeetupsSection() {
    const {
        currentPage,
        totalPages,
        loading,
        error,
        setCurrentPage,
        handleSearchChange,
        handleDateFilter,
        meetups
    } = useMeetups();

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
                    <h1>Error: {error.message}</h1>
                ) : (
                    meetups.map(meetup => (
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
