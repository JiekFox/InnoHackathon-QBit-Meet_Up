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
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

    const buildApiUrl = () => {
        let url = `${MEETINGS_API_URL}?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`;
        if (searchQuery) {
            url += `&search=${searchQuery}`;
        }
        if (dateFilter.startDate) {
            url += `&datetime_beg__gt=${dateFilter.startDate}`;
        }
        if (dateFilter.endDate) {
            url += `&datetime_beg__lt=${dateFilter.endDate}`;
        }
        return url;
    };

    const { data, loading, error } = useFetchMeetings(buildApiUrl());

    useEffect(() => {
        if (data.results) {
            setMeetups(
                data.results.map(item => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    image: item.image || icon,
                    dateTime: item.datetime_beg
                }))
            );
            setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
        }
    }, [data]);

    const handleSearchChange = useCallback(query => {
        setSearchQuery(query);
    }, []);

    const handleDateFilter = useCallback((startDate, endDate) => {
        setDateFilter({ startDate, endDate });
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, dateFilter]);

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
        handleSearchChange,
        handleDateFilter
    };
};
