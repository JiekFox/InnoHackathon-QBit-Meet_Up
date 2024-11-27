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
    // Состояния для карточек, строки поиска, текущей страницы и полного списка встреч
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [meetups, setMeetups] = useState([]);
    /*
  * Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Title ${i + 1}`,
      description: "This is a simple description for the event.",
      image: icon
    }))*/
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
    // Фильтруем и отображаем только элементы для текущей страницы
    const filteredMeetups = meetups.filter(meetup =>
        meetup.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredMeetups.length / ITEMS_PER_PAGE);
    const paginatedMeetups = filteredMeetups.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Обработчик поиска
    const handleSearchChange = query => {
        setSearchQuery(query);
    };
    useEffect(() => {
        // Сбрасываем текущую страницу при изменении строки поиска
        setCurrentPage(1);
    }, [searchQuery]);

    // Обработчик смены страницы
    const handlePageChange = page => {
        setCurrentPage(page);
    };

    return (
        <section className="home">
            {/* Панель фильтров и поиска */}
            <FilterBar onSearchChange={handleSearchChange} />

            {/* Сетка карточек */}
            <div className="meetup-grid">
                {loading ? (
                    <div>loading...</div>
                ) : (
                    paginatedMeetups.map(meetup => (
                        <MeetupCard
                            key={meetup.id}
                            to={`${MEETUP_DETAILS}/${meetup.id}`}
                            {...meetup}
                        />
                    ))
                )}
            </div>

            {/* Пагинация */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </section>
    );
}
