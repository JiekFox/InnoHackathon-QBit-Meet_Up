import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchMeetings from '../api/useFetchMeetings';
import Loader from '../components/Loader';
import PhotoUpload from '../components/PhotoUpload';
import { USER_API_URL } from '../constant/apiURL';

interface UserProfile {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    user_description: string;
    tg_id: string;
    teams_id: string;
    photo: string | null;
}

export default function ProfileViewer() {
    const { id } = useParams<{ id: string }>();

    const {
        data: formData,
        loading,
        error
    } = useFetchMeetings<UserProfile>(`${USER_API_URL}${id}/`);

    if (loading) return <Loader />;
    if (error) return <div className="error-message">{error}</div>;
    if (!formData) return <div className="error-message">User not found.</div>;

    return (
        <div className="profile-edit-form">
            <form className="profile-form">
                <div className="form-fields">
                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.first_name}
                                readOnly
                                placeholder="Value"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="surname">Surname</label>
                            <input
                                type="text"
                                id="surname"
                                name="surname"
                                value={formData.last_name || ''}
                                readOnly
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
                            readOnly
                            placeholder="Value"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            readOnly
                            placeholder="Username"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="about">About myself</label>
                        <textarea
                            id="about"
                            name="about"
                            value={formData.user_description}
                            readOnly
                            placeholder="Value"
                        />
                    </div>

                    <PhotoUpload
                        photo={formData.photo}
                        classVisible="photo-upload-unvisible"
                    />

                    <div className="input-group">
                        <label htmlFor="tg_id" className="info-label">
                            Telegram ID
                        </label>
                        <input
                            type="text"
                            id="tg_id"
                            name="tg_id"
                            value={formData.tg_id}
                            readOnly
                            placeholder="Telegram ID"
                        />
                    </div>
                </div>

                <PhotoUpload
                    photo={formData.photo}
                    classVisible="photo-upload-visible"
                />
            </form>
        </div>
    );
}
