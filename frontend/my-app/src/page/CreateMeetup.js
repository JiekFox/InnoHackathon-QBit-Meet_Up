import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { MEETINGS_API_URL } from '../constant/apiURL';
import { useNavigate } from 'react-router';
import { SIGN_IN } from '../constant/router';
import { giveConfig } from '../utils/giveConfig';

export function CreateMeetup() {
    const navigate = useNavigate();
    const { token, userID } = useAuth(); // Получаем токен и ID автора из AuthContext
    const [formData, setFormData] = useState({
        title: '',
        datetime_beg: '',
        link: '',
        description: '',
        image: null
    });
    const [error, setError] = useState(null);

    // Обработчик изменения полей
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Обработчик загрузки изображения
    const handleImageUpload = e => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!token) {
            navigate(SIGN_IN); // Если нет токена, перенаправляем на страницу входа
            return;
        }

        const meetingData = new FormData();
        meetingData.append('title', formData.title);
        meetingData.append('author_id', userID); // ID автора
        meetingData.append('datetime_beg', formData.datetime_beg);
        meetingData.append('link', formData.link);
        meetingData.append('description', formData.description);
        if (formData.image) {
            meetingData.append('image', formData.image); // Добавляем изображение
        }

        console.log(formData);

        try {
            const response = await axios.post(
                MEETINGS_API_URL,
                meetingData,
                giveConfig(token)
            );
            console.log('Successfully created meeting:', response.data);
            navigate(`/meetup/${response.id}`);
        } catch (error) {
            console.error(
                'Error creating meeting:',
                error.response?.data || error.message
            );
            setError(error.response?.data || 'An error occurred');
        }
    };

    return (
        <main className="create-meetup">
            <h1>Create New Meetup</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="create-meetup-form">
                <div className="input-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="datetime_beg">Start Date and Time:</label>
                    <input
                        type="datetime-local"
                        id="datetime_beg"
                        name="datetime_beg"
                        value={formData.datetime_beg}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="link">Link:</label>
                    <input
                        type="url"
                        id="link"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="e.g., https://google.com"
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="image">Image:</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
                <button type="submit" className="create-meetup-button">
                    Create Meetup
                </button>
            </form>
        </main>
    );
}
