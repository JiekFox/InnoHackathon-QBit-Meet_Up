import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { MEETUP_DETAILS, SIGN_IN } from '../constant/router';
import Loader from '../components/Loader';
import axios from 'axios';
import { MEETINGS_API_URL } from '../constant/apiURL';
import { giveConfig } from '../utils/giveConfig';

export function EditMeetup() {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        datetime_beg: '',
        link: '',
        description: '',
        image: null
    });
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState();

    const handleChange = useCallback(e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleImageUpload = useCallback(e => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
        }
    }, []);
    useEffect(() => {
        if (!token) {
            navigate(SIGN_IN);
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchMeetupDetails = async () => {
            try {
                const response = await axios.get(
                    `${MEETINGS_API_URL}${id}/`,
                    giveConfig(token)
                );

                setFormData({
                    title: response.data.title || '',
                    datetime_beg:
                        new Date(response.data.datetime_beg)
                            .toISOString()
                            .slice(0, 16) || '',
                    description: response.data.description || '',
                    link: response.data.link || '',
                    image: null
                });
            } catch (error) {
                setError(error.message);
                console.error('Error fetching meetup details:', error);
            }
        };
        fetchMeetupDetails();
    }, [id, setFormData]);

    const handleEditSubmit = async e => {
        e.preventDefault();
        setIsPending(true);

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('datetime_beg', formData.datetime_beg);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('link', formData.link);

        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            await axios.put(
                `${MEETINGS_API_URL}${id}/`,
                formDataToSend,
                giveConfig(token)
            );
            alert('Meetup updated successfully');
            navigate(`${MEETUP_DETAILS}/${id}`);
        } catch (error) {
            setError(error.message);
            console.error('Error updating meetup:', error);
        } finally {
            setIsPending(false);
        }
    };

    if (isPending) return <Loader />;

    return (
        <main className="edit-meetup create-meetup">
            <h1>Edit Meetup</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleEditSubmit} className="create-meetup-form">
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
                <button
                    type="submit"
                    className="edit-meetup-button create-meeting-button"
                >
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </main>
    );
}
