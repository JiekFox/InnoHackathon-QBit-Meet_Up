import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { USER_API_URL } from '../constant/apiURL';
import { useAuth } from '../utils/AuthContext';
import { giveConfig } from '../utils/giveConfig';

export default function Profile() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        about: '',
        username: '',
        tg_id: '',
        teams_id: '',
        photo: null
    });
    const [showTgInfo, setShowTgInfo] = useState(false);
    const { token, userID } = useAuth();
    const [errors, setErrors] = useState({});

    const userId = userID;

    const fetchUserData = async () => {
        if (!token || !token.access) {
            return;
        }
        const config = giveConfig(token);

        try {
            console.log(`${USER_API_URL}${userId}/`, config);
            const response = await axios.get(`${USER_API_URL}${userId}/`, config);
            const userData = response.data;
            setFormData({
                name: userData.first_name || '',
                surname: userData.last_name || '',
                email: userData.email || '',
                about: userData.user_description || '',
                username: userData.username || '',
                tg_id: userData.tg_id || '',
                teams_id: userData.teams_id || '',
                photo: userData.photo || null
            });
        } catch (error) {
            console.error(error.response?.data || error.message);
        }
    };
    const handleSave = async () => {
        if (!token || !token.access) return;

        const config = giveConfig(token);

        const formDataToSend = new FormData();
        formDataToSend.append('first_name', formData.name);
        formDataToSend.append('last_name', formData.surname);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('user_description', formData.about);
        formDataToSend.append('username', formData.username);
        formDataToSend.append('tg_id', formData.tg_id);
        formDataToSend.append('teams_id', formData.teams_id);

        // Если фото есть, добавляем его
        if (formData.photo) {
            formDataToSend.append('photo', formData.photo);
        }

        try {
            const response = await axios.put(
                `${USER_API_URL}${userId}/`,
                formDataToSend,
                config
            );
            console.log(response);
            setErrors({});
            alert('Profile updated successfully!');
        } catch (error) {
            console.log(error);
            if (error.response?.data) {
                setErrors(error.response.data);
            } else {
                console.error(error.message);
            }
        }
    };

    useEffect(() => {
        if (token && token.access) {
            fetchUserData();
        }
    }, [token]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoUpload = e => {
        /*const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
             URL.createObjectURL(file)
        }*/
        const file = e.target.files[0];
        console.log(typeof file);
        if (file) {
            setFormData({ ...formData, photo: file });
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        handleSave();
    };
    console.log(formData);

    return (
        <div className="profile-edit-form">
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-fields">
                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Value"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="surname">Surname</label>
                            <input
                                type="text"
                                id="surname"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                placeholder="Value"
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Value"
                        />
                        {errors.email && (
                            <div className="error-message">{errors.email[0]}</div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                        />
                        {errors.username && (
                            <div className="error-message">{errors.username[0]}</div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="about">About myself</label>
                        <textarea
                            id="about"
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            placeholder="Value"
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="tg_id" className="info-label">
                                Telegram ID
                                <div
                                    className="info-button"
                                    onClick={() => setShowTgInfo(!showTgInfo)}
                                >
                                    🛈
                                </div>
                            </label>
                            <input
                                type="text"
                                id="tg_id"
                                name="tg_id"
                                value={formData.tg_id}
                                onChange={handleChange}
                                placeholder="Telegram ID"
                            />
                            {/*не лучшее решение но как есть */}
                            {showTgInfo ? (
                                <div className="info-popup">
                                    To get your Telegram ID, message this bot:{' '}
                                    <a
                                        href="https://t.me/userinfobot"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        @userinfobot
                                    </a>
                                </div>
                            ) : (
                                <div className="info-popup" />
                            )}
                        </div>
                        <div className="input-group">
                            <label htmlFor="teams_id">Teams ID</label>
                            <input
                                type="text"
                                id="teams_id"
                                name="teams_id"
                                value={formData.teams_id}
                                onChange={handleChange}
                                placeholder="Teams ID"
                            />
                        </div>
                    </div>

                    <button type="submit" className="save-button">
                        Save Changes
                    </button>
                </div>

                <div className="photo-upload">
                    <div className="photo-preview">
                        {formData.photo ? (
                            typeof formData.photo === 'object' ? (
                                <img
                                    src={URL.createObjectURL(formData.photo)}
                                    alt="Uploaded"
                                />
                            ) : (
                                <img src={formData.photo} alt="Uploaded" />
                            )
                        ) : (
                            <div className="placeholder">Upload photo</div>
                        )}
                    </div>
                    <label htmlFor="photo-upload" className="photo-upload-label">
                        Upload photo
                    </label>
                    <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="photo-input"
                    />
                </div>
            </form>
        </div>
    );
}
