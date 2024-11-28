import FilterBar from './FilterBar';
import MeetupCard from './MeetupCard';
import Pagination from './Pagination';
import icon from '../../assets/img/icon.png';
import { MEETUP_DETAILS } from '../../constant/router';
import React, { useEffect, useState } from 'react';
import useFetchMeetings from '../../api/useFetchMeetings';
import { MEETINGS_API_URL } from '../../constant/apiURL';

const ITEMS_PER_PAGE = 5;

export default function MeetupsSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [meetups, setMeetups] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    const { data, loading, error } = useFetchMeetings(
        `${MEETINGS_API_URL}?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`
    );

    useEffect(() => {
        if (data.results) {
            console.log(data.results);
            setMeetups(
                data.results.map(item => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    image: item.image ? item.image : icon,
                    dateTime: item.datetime_beg
                }))
            );

            setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
        }
    }, [data]);

    const handleSearchChange = query => {
        setSearchQuery(query);
    };
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);
    const filteredMeetups = meetups.filter(meetup =>
        meetup.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="home">
            <FilterBar onSearchChange={handleSearchChange} />

            <div className="meetup-grid">
                {loading ? (
                    <div>Loading...</div>
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
