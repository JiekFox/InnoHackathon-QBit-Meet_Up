import React, { useState, useEffect, useCallback } from 'react';
import FilterBar from './FilterBar';
import Pagination from './Pagination';
import Loader from './Loader'; // Предполагается, что у вас есть компонент Loader

// Определение типов для пропсов
interface UnifiedDataListProps<T> {
    fetchFunction: (
        params: Record<string, string>
    ) => Promise<{ results: T[]; count: number }>;
    renderItem: (item: T) => React.ReactNode;
    pageSize?: number;
    listContainerClassName?: string;
    itemContainerClassName?: string;
    // Пропсы для FilterBar, которые будут переданы дальше
    onRecommendByAI?: () => void;
    onQueryTuchUseAI?: () => void;
    enableDateFilter?: boolean;
}

// Тип для элемента данных с обязательным полем id
interface DataItem {
    id: number | string;
}

export function UnifiedDataList<T extends DataItem>({
    fetchFunction,
    renderItem,
    pageSize = 10,
    listContainerClassName = 'data-list',
    itemContainerClassName = 'data-list-item',
    onRecommendByAI,
    onQueryTuchUseAI,
    enableDateFilter = true // По умолчанию фильтр по дате включен
}: UnifiedDataListProps<T>) {
    // --- Состояние компонента ---
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    // Состояние для всех фильтров
    const [filters, setFilters] = useState({
        query: '',
        startDate: '',
        endDate: ''
    });

    // --- Логика загрузки данных ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params: Record<string, string> = {
            page: currentPage.toString(),
            page_size: pageSize.toString(),
            ...(filters.query && { search: filters.query }),
            ...(filters.startDate && { datetime_beg__gt: filters.startDate }),
            ...(filters.endDate && { datetime_beg__lt: filters.endDate })
        };

        try {
            const response = await fetchFunction(params);
            if (response?.results) {
                setData(response.results);
                setTotalPages(Math.ceil(response.count / pageSize));
            } else {
                setData([]);
                setTotalPages(0);
            }
        } catch (err) {
            setError((err as Error).message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, fetchFunction]);

    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData уже включает все зависимости

    // --- Обработчики для дочерних компонентов ---
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (query: string) => {
        // При новом поиске сбрасываем на первую страницу
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, query }));
    };

    const handleDateFilterApply = (startDate: string, endDate: string) => {
        // При применении фильтра дат сбрасываем на первую страницу
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, startDate, endDate }));
    };

    // --- Рендеринг ---
    return (
        <div className="unified-data-container">
            <FilterBar
                onSearchChange={handleSearchChange}
                onDateFilter={enableDateFilter ? handleDateFilterApply : undefined}
                onRecommendByAI={onRecommendByAI}
                onQueryTuchUseAI={onQueryTuchUseAI}
            />

            <div className="data-content">
                {loading ? (
                    <Loader />
                ) : error ? (
                    <div className="error-message">Error: {error}</div>
                ) : data.length > 0 ? (
                    <div className={listContainerClassName}>
                        {data.map(item => (
                            <div key={item.id} className={itemContainerClassName}>
                                {renderItem(item)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results-message">No results found.</div>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
