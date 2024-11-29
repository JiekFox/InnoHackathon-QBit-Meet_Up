import React from 'react';
import { useParams } from 'react-router-dom';
import useFetchMeetings from '../api/useFetchMeetings';
import Loader from '../components/Loader';
import PhotoUpload from '../components/PhotoUpload';
import { USER_API_URL } from '../constant/apiURL';

export default function ProfileViewer() {
    const { id } = useParams();
    const {
        data: formData,
        loading,
        error
    } = useFetchMeetings(`${USER_API_URL}${id}/`);
    if (loading) return <Loader />;
    if (error) return <div className="error-message">{error}</div>;

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
                    <div className="input-row">
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
                        <div className="input-group">
                            <label htmlFor="teams_id">Teams ID</label>
                            <input
                                type="text"
                                id="teams_id"
                                name="teams_id"
                                value={formData.teams_id}
                                readOnly
                                placeholder="Teams ID"
                            />
                        </div>
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
