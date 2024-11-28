import React, { useState, useCallback } from "react";
import DebounceInput from "./DebounceInput";
import axios from "axios";
import { useAuth } from '../utils/AuthContext';
import { BASE_API_URL, GPT_URL } from '../constant/apiURL';
import {useMeetups} from "../utils/hooks/useMeetups.js";


const FilterBar = React.memo(({ onSearchChange, onDateFilter,onRecommendByAI, isLoading }) => {
    const { token, userID } = useAuth(); // Получаем токен и userID
    const [showDateFilters, setShowDateFilters] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const {handleRecommendedByAI} = useMeetups();


    const handleSearchChange = useCallback(
        (query) => {
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
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                    <button onClick={handleDateFilterApply} className="apply-button">
                        Apply
                    </button>
                </div>
            )}

            <button
                className="AI-buttons"
                onClick={onRecommendByAI}
                disabled={isLoading}
            >
                {isLoading ? "Loading AI recommendations..." : "Recommended by AI ✨"}
            </button>
        </div>
    );
});

export default FilterBar;
