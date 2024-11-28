import React, { useState, useCallback } from "react";
import DebounceInput from "./DebounceInput";
import axios from "axios";
import { useAuth } from '../utils/AuthContext';

const FilterBar = React.memo(({ onSearchChange, onDateFilter }) => {
    const { token, userID } = useAuth(); // Получаем токен и userID
    const [showDateFilters, setShowDateFilters] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const GPT_URL = process.env.GPT_URL;
    const GPT_PROMPT = process.env.GPT_PROMPT;

    const handleSearchChange = useCallback(
        (query) => {
            onSearchChange(query);
        },
        [onSearchChange]
    );

    const handleDateFilterApply = () => {
        onDateFilter(startDate, endDate);
    };

    const handleRecommendedByAI = async () => {
        try {
            if (!userID) {
                console.error("User ID not set. Please login first.");
                return;
            }

            // Шаг 1: Получаем описание пользователя
            const userResponse = await axios.get(`${BACKEND_URL}/api/users/${userID}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userDescription = userResponse.data?.user_description;

            if (!userDescription) {
                console.error("No user description found for this user.");
                return;
            }

            // Шаг 2: Получаем 50 последних митапов
            const page = 1;
            const pageSize = 50;
            const meetupsResponse = await axios.get(
                `${BACKEND_URL}/meetings/?page=${page}&page_size=${pageSize}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const meetups = meetupsResponse.data?.results || [];

            // Формируем данные для GPT
            const formattedMeetups = meetups
                .map((meetup) => `${meetup.id}+${meetup.description}`)
                .join(", ");

            const gptRequest = GPT_PROMPT;

            // Шаг 3: Отправляем запрос к GPT API
            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptRequest },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            console.log("GPT Response:", gptResponse.data);
        } catch (error) {
            console.error("Error occurred while processing AI recommendation:", error);
        }
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

            <button className="AI-buttons" onClick={handleRecommendedByAI}>
                Recommended by AI✨
            </button>
        </div>
    );
});

export default FilterBar;
