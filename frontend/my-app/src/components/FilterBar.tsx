import React, { useState, useCallback } from 'react';
import DebounceInput from './DebounceInput';

interface FilterBarProps {
    onSearchChange: (query: string) => void;
    onDateFilter?: (startDate: string, endDate: string) => void;
    onRecommendByAI?: () => Promise<void>;
    onQueryTuchUseAI?: () => Promise<void>;
}

const FilterBar: React.FC<FilterBarProps> = React.memo(
    ({ onSearchChange, onDateFilter, onRecommendByAI, onQueryTuchUseAI }) => {
        const [showDateFilters, setShowDateFilters] = useState<boolean>(false);
        const [startDate, setStartDate] = useState<string>('');
        const [endDate, setEndDate] = useState<string>('');

        const [isAiSearchLoading, setIsAiSearchLoading] = useState(false);
        const [isAiRecommendLoading, setIsAiRecommendLoading] = useState(false);

        const handleSearchChange = useCallback(
            (query: string) => {
                onSearchChange(query);
            },
            [onSearchChange]
        );

        const handleDateFilterApply = () => {
            if (onDateFilter) {
                onDateFilter(startDate, endDate);
            }
        };

        const handleAiSearchClick = async () => {
            if (!onQueryTuchUseAI) return;

            setIsAiSearchLoading(true);
            try {
                await onQueryTuchUseAI();
            } finally {
                setIsAiSearchLoading(false);
            }
        };

        const handleAiRecommendClick = async () => {
            if (!onRecommendByAI) return;

            setIsAiRecommendLoading(true);
            try {
                await onRecommendByAI();
            } finally {
                setIsAiRecommendLoading(false);
            }
        };

        return (
            <div className="filter-bar">
                {onDateFilter && (
                    <>
                        <button
                            className="filter-button"
                            onClick={() => setShowDateFilters(!showDateFilters)}
                        >
                            Filter by Date
                        </button>
                        {showDateFilters && (
                            <div className="date-filters">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    placeholder="Start Date"
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    placeholder="End Date"
                                />
                                <button
                                    onClick={handleDateFilterApply}
                                    className="apply-button"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </>
                )}
                <DebounceInput
                    type="text"
                    id="search"
                    name="search"
                    placeholder="Search meetups..."
                    className="search-input"
                    onChange={handleSearchChange}
                    delay={500}
                />

                {onQueryTuchUseAI && (
                    <button
                        className={`ai-button ai-button-meetups-section ${isAiSearchLoading ? 'ai-loading' : ''}`}
                        onClick={handleAiSearchClick}
                        disabled={isAiSearchLoading}
                    >
                        {isAiSearchLoading ? 'Thinking...' : 'Find with AI✨'}
                    </button>
                )}

                {onRecommendByAI && (
                    <button
                        className={`ai-button ai-button-meetups-section ${isAiRecommendLoading ? 'ai-loading' : ''}`}
                        onClick={handleAiRecommendClick}
                        disabled={isAiRecommendLoading}
                    >
                        {isAiRecommendLoading
                            ? 'Analyzing...'
                            : 'Recommended by AI ✨'}
                    </button>
                )}
            </div>
        );
    }
);

export default FilterBar;
