// src/hooks/useDataGrid.ts

import { useState, useEffect, useCallback } from 'react';
import { ParamsForFetch } from '../../constant/types';

const ITEMS_PER_PAGE = 12;

// Тип для функции, которая будет загружать данные
// Она принимает параметры и должна вернуть данные и их общее количество
type Fetcher<T> = (
    params: ParamsForFetch
) => Promise<{ results: T[]; count: number }>;

export const useDataGrid = <T>(fetchFunction: Fetcher<T>) => {
    const [items, setItems] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Основной эффект для загрузки данных при изменении фильтров или страницы
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const params: ParamsForFetch = {
                    page: currentPage,
                    pageSize: ITEMS_PER_PAGE,
                    search: searchQuery,
                    startDate: dateFilter.startDate,
                    endDate: dateFilter.endDate
                };
                const response = await fetchFunction(params);
                setItems(response.results);
                setTotalPages(Math.ceil((response.count || 0) / ITEMS_PER_PAGE));
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error('An unknown error occurred')
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentPage, searchQuery, dateFilter, fetchFunction]);

    // Сбрасываем страницу на первую при изменении фильтров
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, dateFilter]);

    // Обработчики для FilterBar
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleDateFilter = useCallback((startDate: string, endDate: string) => {
        setDateFilter({ startDate, endDate });
    }, []);

    return {
        items,
        currentPage,
        totalPages,
        loading,
        error,
        searchQuery, // Экспортируем для AI функций
        // Методы для управления состоянием
        setCurrentPage,
        handleSearchChange,
        handleDateFilter,
        // Методы для прямого управления состоянием извне (для AI логики)
        setLoading,
        setItems,
        setTotalPages
    };
};
