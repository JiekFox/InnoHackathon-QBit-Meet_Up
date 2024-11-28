import React, { useState, useCallback } from 'react';
import DebounceInput from './DebounceInput';

const FilterBar = React.memo(({ onSearchChange, onDateFilter }) => {
    console.log(onDateFilter);
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
            <DebounceInput
                type="text"
                id="search"
                name="search"
                placeholder="Search meetups..."
                className="search-input"
                onChange={handleSearchChange}
                delay={500}
            />

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
                    <button onClick={handleDateFilterApply} className="apply-button">
                        Apply
                    </button>
                </div>
            )}

            <button
                className="AI-buttons"
                onClick={() => {
                    console.log('AI recommendations coming soon!');
                }}
            >
                Recommended by AI✨
            </button>
        </div>
    );
});

export default FilterBar;
