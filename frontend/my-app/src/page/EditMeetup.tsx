import React, {
    useCallback,
    useEffect,
    useState,
    ChangeEvent,
    FormEvent,
    JSX
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { MEETUP_DETAILS, SIGN_IN } from '../constant/router';
import Loader from '../components/Loader';
import { MEETINGS_API_URL } from '../constant/apiURL';
import { useAxiosWithAuth } from '../utils/hooks/useAxiosWithAuth';

interface FormDataState {
    title: string;
    datetime_beg: string;
    link: string;
    description: string;
    image: File | null;
}

export function EditMeetup(): JSX.Element {
    const { token } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const axios = useAxiosWithAuth();

    const [formData, setFormData] = useState<FormDataState>({
        title: '',
        datetime_beg: '',
        link: '',
        description: '',
        image: null
    });
    const [isPending, setIsPending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'image/webp') {
                setError(
                    'WebP images are not allowed. Please choose a different format.'
                );
                return;
            }
            setFormData(prev => ({ ...prev, image: file }));
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    }, []);

    useEffect(() => {
        if (!token) {
            navigate(SIGN_IN);
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchMeetupDetails = async () => {
            setIsPending(true);
            try {
                const response = await axios.get(`${MEETINGS_API_URL}${id}/`);
                console.log(response);
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
                console.log(response.data.image);
                setPreviewUrl(response.data.image || null);
            } catch (error: any) {
                setError(error.message || 'Failed to fetch meetup details.');
                console.error('Error fetching meetup details:', error);
            } finally {
                setIsPending(false);
            }
        };

        fetchMeetupDetails();
    }, [id, token]);

    const handleEditSubmit = async (e: FormEvent) => {
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
            await axios.put(`${MEETINGS_API_URL}${id}/`, formDataToSend);
            //await axios.put(`${MEETINGS_API_URL}${id}/`, formDataToSend, config);
            alert('Meetup updated successfully');
            navigate(`${MEETUP_DETAILS}/${id}`);
        } catch (error: any) {
            setError(error.message || 'Failed to update meetup.');
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
                {/* <div className="input-group">
                    <label htmlFor="image">Image:</label>
                    <div className="image-upload-wrapper">
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        {previewUrl && (
                            <div className="preview-box">
                                <img src={previewUrl} alt="Preview" />
                            </div>
                        )}
                    </div>
                </div>*/}
                <div className="image-upload-wrapper">
                    <label
                        htmlFor="customFileInput"
                        className="custom-file-label edit-meetup-button create-meeting-button"
                    >
                        Select image
                    </label>
                    <input
                        type="file"
                        id="customFileInput"
                        name="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden-file-input"
                    />
                    {previewUrl && (
                        <div className="preview-box">
                            <img src={previewUrl} alt="Preview" />
                        </div>
                    )}
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
