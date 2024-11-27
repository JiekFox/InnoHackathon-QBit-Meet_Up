import FilterBar from './FilterBar';
import MeetupCard from './MeetupCard';
import Pagination from './Pagination';
import icon from '../../assets/img/icon.png';
import { MEETUP_DETAILS } from '../../constant/router';
import React, { useEffect, useState } from 'react';
import useFetchMeetings from '../../api/useFetchMeetings';
import { MEETINGS_API_URL } from '../../constant/apiURL';

// Константа для количества элементов на странице
const ITEMS_PER_PAGE = 20;

export default function MeetupsSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [meetups, setMeetups] = useState([]);

    const { data, loading, error } = useFetchMeetings(MEETINGS_API_URL);
    useEffect(() => {
        setMeetups(
            data.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.image ? item.image : icon
            }))
        );
    }, [data]);

    const filteredMeetups = meetups.filter(meetup =>
        meetup.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredMeetups.length / ITEMS_PER_PAGE);
    const paginatedMeetups = filteredMeetups.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSearchChange = query => {
        setSearchQuery(query);
    };
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePageChange = page => {
        setCurrentPage(page);
    };

    return (
        <section className="home">
            <FilterBar onSearchChange={handleSearchChange} />

            <div className="meetup-grid">
                {loading ? (
                    <div>loading...</div>
                ) : (
                    error ? <h1>error: {error.message}</h1> : (
                    paginatedMeetups.map(meetup => (
                        <MeetupCard
                            key={meetup.id}
                            to={`${MEETUP_DETAILS}/${meetup.id}`}
                            {...meetup}
                        />
                    ))
                    )
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </section>
    );
}
