import React, { useState } from 'react';
import { useProfileForm } from '../utils/hooks/useProfileForm';
import Loader from '../components/Loader';
import PhotoUpload from '../components/PhotoUpload';

export default function Profile() {
    const [showTgInfo, setShowTgInfo] = useState(false);

    const {
        finalValues,
        errors,
        loading,
        photoPreview,
        handleChange,
        handlePhotoDelete,
        handlePhotoUpload,
        handleSave
    } = useProfileForm();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave();
    };

    if (errors.global) return <p>Error: {errors.global}</p>;
    if (loading) return <Loader />;

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
                                value={finalValues.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="surname">Surname</label>
                            <input
                                type="text"
                                id="surname"
                                name="surname"
                                value={finalValues.surname}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={finalValues.email}
                            onChange={handleChange}
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
                            value={finalValues.username}
                            onChange={handleChange}
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
                            value={finalValues.about}
                            onChange={handleChange}
                        />
                    </div>

                    <PhotoUpload
                        photo={photoPreview}
                        onPhotoUpload={handlePhotoUpload}
                        onPhotoDelete={handlePhotoDelete}
                        classVisible="photo-upload-unvisible"
                    />

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
                            value={finalValues.tg_id}
                            onChange={handleChange}
                        />

                        {showTgInfo && (
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
                        )}
                    </div>

                    <button type="submit" className="save-button">
                        Save Changes
                    </button>
                </div>

                <PhotoUpload
                    photo={photoPreview}
                    onPhotoUpload={handlePhotoUpload}
                    classVisible="photo-upload-visible"
                    onPhotoDelete={handlePhotoDelete}
                />
            </form>
        </div>
    );
}
