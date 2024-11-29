import React, { useState, useCallback } from 'react';
import DebounceInput from './DebounceInput';

const FilterBar = React.memo(
    ({ onSearchChange, onDateFilter, onRecommendByAI, onQueryTuchUseAI }) => {
        const [showDateFilters, setShowDateFilters] = useState(false);
        const [startDate, setStartDate] = useState('');
        const [endDate, setEndDate] = useState('');

        const handleSearchChange = useCallback(
            query => {
                onSearchChange(query);
            },
            [onSearchChange]
        );

        const handleDateFilterApply = () => {
            onDateFilter(startDate, endDate);
        };

        return (
            <div className="filter-bar">
                {onDateFilter && (
                    <>
                        {' '}
                        <button
                            className="filter-button"
                            onClick={() => setShowDateFilters(!showDateFilters)}
                        >
                            Filter by Date 🗓️
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
                        className="ai-button ai-button-meetups-section"
                        onClick={onQueryTuchUseAI}
                    >
                        Find with AI✨
                    </button>
                )}
                {onRecommendByAI && (
                    <button
                        className="ai-button ai-button-meetups-section"
                        onClick={onRecommendByAI}
                    >
                        Recommended by AI ✨
                    </button>
                )}
            </div>
        );
    }
);
export default FilterBar;
