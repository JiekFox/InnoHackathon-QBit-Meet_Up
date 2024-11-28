import React, { useCallback } from 'react';
import DebounceInput from '../DebounceInput';

const FilterBar = React.memo(({ onSearchChange }) => {
    const handleSearchChange = useCallback(
        query => {
            onSearchChange(query);
        },
        [onSearchChange]
    );

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
                className="AI-buttons"
                onClick={() => {
                    console.log(1);
                }}
            >
                {' '}
                Recommended by AI✨{' '}
            </button>
        </div>
    );
});

export default FilterBar;
