import React, { useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import MeetupCard from '../components/MeetupCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import { useUserMeetups } from '../utils/hooks/useUserMeetups';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MEETUP_DETAILS, SIGN_IN } from "../constant/router";

export default function MyMeetupsSubscriber() {
    const { token } = useAuth();
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
    } = useUserMeetups('meetings_signed');

    return (
        <section className="home">
            <FilterBar onSearchChange={handleSearchChange} />

            <div className="meetup-grid">
                {loading ? (
                    <Loader />
                ) : error ? (
                    <h1>Error: {error}</h1>
                ) : paginatedMeetups.length > 0 ? (
                    paginatedMeetups.map(meetup => (
                        <MeetupCard key={meetup.id} to={`${MEETUP_DETAILS}/${meetup.id}`} {...meetup} />
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
