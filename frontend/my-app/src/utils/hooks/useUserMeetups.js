import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { USER_API_URL } from '../../constant/apiURL';
import { giveConfig } from '../giveConfig';
import icon from '../../assets/img/icon.png';

const ITEMS_PER_PAGE = 12;
export const useUserMeetups = path => {
    const [meetups, setMeetups] = useState([]);
    const [filteredMeetups, setFilteredMeetups] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
    const { token, userID } = useAuth();

    useEffect(() => {
        const fetchMeetups = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `${USER_API_URL}${userID}/${path}/`,
                    giveConfig(token)
                );
                const results = response.data || [];
                setMeetups(
                    results.map(item => ({
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        image: item.image || icon,
                        dateTime: item.datetime_beg
                    }))
                );
                setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
            } catch (err) {
                setError(err.response?.data?.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchMeetups();
    }, [userID, token, path]);

    const handleSearchChange = useCallback(query => {
        setSearchQuery(query);
    }, []);

    const handleDateFilter = useCallback((startDate, endDate) => {
        setDateFilter({ startDate, endDate });
    }, []);

    useEffect(() => {
        let filtered = meetups;

        if (searchQuery) {
            filtered = filtered.filter(meetup =>
                meetup.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (dateFilter.startDate) {
            filtered = filtered.filter(
                meetup => new Date(meetup.dateTime) >= new Date(dateFilter.startDate)
            );
        }

        if (dateFilter.endDate) {
            filtered = filtered.filter(
                meetup => new Date(meetup.dateTime) <= new Date(dateFilter.endDate)
            );
        }

        setFilteredMeetups(filtered);
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
    }, [searchQuery, dateFilter, meetups]);

    const paginatedMeetups = filteredMeetups.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    console.log(handleDateFilter);
    return {
        searchQuery,
        paginatedMeetups,
        currentPage,
        totalPages,
        loading,
        error,
        setCurrentPage,
        handleSearchChange,
        handleDateFilter
    };
};
