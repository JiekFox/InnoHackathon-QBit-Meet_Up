import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useProfileActions } from '../utils/hooks/useProfileActions';
import PhotoUpload from '../components/PhotoUpload';
import Loader from '../components/Loader';

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

    const { fetchUserData, handleSave, loading } = useProfileActions(
        userID,
        token,
        formData,
        setFormData,
        setErrors
    );

    useEffect(() => {
        if (token && token.access) {
            fetchUserData();
        }
    }, [token, fetchUserData]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoUpload = e => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photo: file });
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        handleSave();
    };

    return (
        <div className="profile-edit-form">
            {loading ? (
                <Loader />
            ) : (
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
                                <div className="error-message">
                                    {errors.email[0]}
                                </div>
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
                                <div className="error-message">
                                    {errors.username[0]}
                                </div>
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
                        <PhotoUpload
                            photo={formData.photo}
                            onPhotoUpload={handlePhotoUpload}
                            classVisible="photo-upload-unvisible"
                        />
                        {/*<div className="input-row">*/}
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
                            {/*<div className="input-group">
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
                        </div>*/}

                        <button type="submit" className="save-button">
                            Save Changes
                        </button>
                    </div>

                    <PhotoUpload
                        photo={formData.photo}
                        onPhotoUpload={handlePhotoUpload}
                        classVisible="photo-upload-visible"
                    />
                </form>
            )}
        </div>
    );
}
