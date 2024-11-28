import { useState, useEffect, useCallback } from 'react';
import useFetchMeetings from '../../api/useFetchMeetings';
import { MEETINGS_API_URL } from '../../constant/apiURL';
import icon from '../../assets/img/icon.png';

const ITEMS_PER_PAGE = 12;

export const useMeetups = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [meetups, setMeetups] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    const { data, loading, error } = useFetchMeetings(
        `${MEETINGS_API_URL}?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`
    );

    useEffect(() => {
        if (data.results) {
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

    const handleSearchChange = useCallback(query => {
        setSearchQuery(query);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredMeetups = meetups.filter(meetup =>
        meetup.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        searchQuery,
        filteredMeetups,
        currentPage,
        totalPages,
        loading,
        error,
        setCurrentPage,
        handleSearchChange
    };
};
