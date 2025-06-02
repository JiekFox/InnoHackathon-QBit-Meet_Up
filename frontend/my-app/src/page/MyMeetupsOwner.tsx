import Pagination from '../components/Pagination';
import React, { useEffect } from 'react';
import { useUserMeetups } from '../utils/hooks/useUserMeetups';
import FilterBar from '../components/FilterBar';
import Loader from '../components/Loader';
import MeetupCard from '../components/MeetupCard';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MEETUP_DETAILS, SIGN_IN } from '../constant/router';

export default function MyMeetups() {
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
    } = useUserMeetups('meetings_owned');

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
    );
}
