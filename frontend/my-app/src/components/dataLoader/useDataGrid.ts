import { useState, useCallback } from 'react';
import { ParamsForFetch } from '../../constant/types';

const ITEMS_PER_PAGE = 12;

type Fetcher<T> = (
    params: ParamsForFetch
) => Promise<{ results: T[]; count: number }>;

export const useDataGrid = <T>(fetchFunction: Fetcher<T>) => {
    const [items, setItems] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadData = async ({
        page = currentPage,
        search = searchQuery,
        startDate = dateFilter.startDate,
        endDate = dateFilter.endDate
    }: Partial<ParamsForFetch> = {}) => {
        setLoading(true);
        try {
            const params: ParamsForFetch = {
                page,
                pageSize: ITEMS_PER_PAGE,
                search,
                startDate,
                endDate
            };
            const response = await fetchFunction(params);
            setItems(response.results);
            setTotalPages(Math.ceil((response.count || 0) / ITEMS_PER_PAGE));
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err : new Error('An unknown error occurred')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = useCallback(async (query: string) => {
        await loadData({ page: 1, search: query });
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handleDateFilter = useCallback(
        async (startDate: string, endDate: string) => {
            await loadData({ page: 1, startDate, endDate });
            const newFilter = { startDate, endDate };
            setDateFilter(newFilter);
            setCurrentPage(1);
        },
        []
    );

    const handlePageChange = useCallback(async (page: number) => {
        await loadData({ page });
        setCurrentPage(page);
    }, []);

    return {
        items,
        currentPage,
        totalPages,
        loading,
        error,
        searchQuery,
        setCurrentPage: handlePageChange,
        handleSearchChange,
        handleDateFilter,
        setLoading,
        setItems,
        setTotalPages
    };
};
