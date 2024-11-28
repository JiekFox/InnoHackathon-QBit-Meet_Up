import React, { useState, useCallback } from "react";
import DebounceInput from "./DebounceInput";
import axios from "axios";
import { useAuth } from '../utils/AuthContext';
import { BASE_API_URL, GPT_URL } from '../constant/apiURL';


const FilterBar = React.memo(({ onSearchChange, onDateFilter }) => {
    const { token, userID } = useAuth(); // Получаем токен и userID
    const [showDateFilters, setShowDateFilters] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const BACKEND_URL = BASE_API_URL;
    console.log("GPT_URL new:", GPT_URL);

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
        console.log("GPT_URL new:", GPT_URL);
        try {
            if (!userID) {
                console.error("User ID not set. Please login first.");
                return;
            }

            // Шаг 1: Получаем описание пользователя
            const userResponse = await axios.get(`${BACKEND_URL}users/${userID}/`, {
                headers: { Authorization: `Bearer ${token.access}` },
            });
            console.log("User response:", userResponse.data);

            const userDescription = userResponse.data?.user_description;

            if (!userDescription) {
                console.error("No user description found for this user.");
                return;
            }

            // Шаг 2: Получаем 50 последних митапов
            const page = 1;
            const pageSize = 50;
            const meetupsResponse = await axios.get(
                `${BACKEND_URL}meetings/?page=${page}&page_size=${pageSize}`,
                {
                    headers: { Authorization: `Bearer ${token.access}` },
                }
            );
            const meetups = meetupsResponse.data?.results || [];

            // Формируем данные для GPT
            const formattedMeetups = meetups
                .map((meetup) => `${meetup.id}+${meetup.description}`)
                .join(", ");

            const gptPrompt = `Тебе дано описание интересов пользователя: ${userDescription}. И список существующих митапов в формате ${formattedMeetups}. Твоя задача: подумать, какие митапы, исходя из их описания, были бы интересны пользователю, и дать мне ответ строго в таком формате "Success, id:[массив из id, которые ты считаешь, были бы интересны пользователю]" Если ты не смог найти ничего подходящего, возвращаешь мне строго такой ответ: "Fail, 'nothing interesting was found'"`;

            // Шаг 3: Отправляем запрос к GPT API
            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptPrompt },
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
