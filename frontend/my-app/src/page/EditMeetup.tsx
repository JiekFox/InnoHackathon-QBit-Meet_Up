import React, {
    useCallback,
    useEffect,
    useState,
    useRef,
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
import { ImagePreview } from '../components/ImagePreview';

interface FormDataState {
    title: string;
    datetime_beg: string;
    link: string;
    description: string;
    image: File | null;
}

const baseValues: FormDataState = {
    title: '',
    datetime_beg: '',
    link: '',
    description: '',
    image: null
};

export function EditMeetup(): JSX.Element {
    const { token } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const axios = useAxiosWithAuth();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [serverValues, setServerValues] = useState<FormDataState | null>(null);
    const [userValues, setUserValues] = useState<Partial<FormDataState>>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const finalValues: FormDataState = {
        ...baseValues,
        ...serverValues,
        ...userValues
    };

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                const data = response.data;

                setServerValues({
                    title: data.title || '',
                    datetime_beg: new Date(data.datetime_beg)
                        .toISOString()
                        .slice(0, 16),
                    description: data.description || '',
                    link: data.link || '',
                    image: null
                });

                setPreviewUrl(data.image || null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch meetup details.');
            } finally {
                setIsPending(false);
            }
        };

        fetchMeetupDetails();
    }, [id]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setUserValues(prev => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUserValues(prev => ({ ...prev, image: file }));
        setPreviewUrl(URL.createObjectURL(file));
    }, []);

    const handleRemoveImage = useCallback(() => {
        setPreviewUrl(null);
        setUserValues(prev => ({ ...prev, image: null }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            const formDataToSend = new FormData();

            Object.entries(userValues).forEach(([key, value]) => {
                console.log(key, value);
                const tempValue = value === null ? '' : value;
                formDataToSend.append(key, tempValue as any);
            });
            console.log([...formDataToSend]);

            await axios.patch(`${MEETINGS_API_URL}${id}/`, formDataToSend);

            alert('Meetup updated successfully');
            navigate(`${MEETUP_DETAILS}/${id}`);
        } catch (error: any) {
            setError(error.message || 'Failed to update meetup.');
        } finally {
            setIsPending(false);
        }
    };

    if (isPending && !serverValues) return <Loader />;

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
                        value={finalValues.title}
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
                        value={finalValues.datetime_beg}
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
                        value={finalValues.link}
                        onChange={handleChange}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={finalValues.description}
                        onChange={handleChange}
                        required
                    />
                </div>

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
                        ref={fileInputRef}
                    />
                    <div className="preview-box">
                        <ImagePreview
                            previewUrl={previewUrl}
                            onRemove={handleRemoveImage}
                        />
                    </div>
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
