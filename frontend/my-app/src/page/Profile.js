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
        photo: null
    });
    const { token, userID } = useAuth();

    const userId = userID;

    const fetchUserData = async () => {
        if (!token || !token.access) {
            console.error('No access token found');
            return;
        }
        const config = giveConfig(token);

        try {
            //console.log(`${USER_API_URL}${userId}`, config, token, userID);
            const response = await axios.get(`${USER_API_URL}${userId}/`, config); // Получаем данные пользователя с авторизацией
            const userData = response.data;
            console.log(userData);

            setFormData({
                name: userData.first_name || '',
                surname: userData.last_name || '',
                email: userData.email || '',
                about: userData.user_description || '',
                photo: userData.photo || null
            });
        } catch (error) {
            console.error(
                'Error fetching user data:',
                error.response?.data || error.message
            );
        }
    };

    useEffect(() => {
        if (token && token.access) {
            fetchUserData();
        }
    }, [token]);

    const onSave = data => {
        console.log(data);
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoUpload = e => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, photo: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

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
                    <button type="submit" className="save-button">
                        Save Changes
                    </button>
                </div>

                <div className="photo-upload">
                    <div className="photo-preview">
                        {formData.photo ? (
                            <img src={formData.photo} alt="Uploaded" />
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
