import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileForm } from '../utils/hooks/useProfileForm';
import Loader from '../components/Loader';
import PhotoUpload from '../components/PhotoUpload';

export default function Profile() {
    const { t } = useTranslation();
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
                            <label htmlFor="name">{t('profile.nameLabel')}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder={t('profile.namePlaceholder')}
                                value={finalValues.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="surname">
                                {t('profile.surnameLabel')}
                            </label>
                            <input
                                type="text"
                                id="surname"
                                name="surname"
                                placeholder={t('profile.surnamePlaceholder')}
                                value={finalValues.surname}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">{t('profile.emailLabel')}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder={t('profile.emailPlaceholder')}
                            value={finalValues.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <div className="error-message">{errors.email[0]}</div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="username">
                            {t('profile.usernameLabel')}
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder={t('profile.usernamePlaceholder')}
                            value={finalValues.username}
                            onChange={handleChange}
                        />
                        {errors.username && (
                            <div className="error-message">{errors.username[0]}</div>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="about">{t('profile.aboutLabel')}</label>
                        <textarea
                            id="about"
                            name="about"
                            placeholder={t('profile.aboutPlaceholder')}
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

                    <button type="submit" className="save-button">
                        {t('profile.saveButton')}
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
