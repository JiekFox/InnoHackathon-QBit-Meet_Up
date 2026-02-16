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
import { BASE, MEETUP_DETAILS, SIGN_IN } from '../constant/router';
import Loader from '../components/Loader';
import { MEETINGS_API_URL, TAGS_API_URL } from '../constant/apiURL';
import { useAxiosWithAuth } from '../utils/hooks/useAxiosWithAuth';
import { ImagePreview } from '../components/ImagePreview';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import TagSelector, { Tag } from '../components/TagSelector';
import { getErrorDescription } from '../utils';

interface FormDataState {
    title: string;
    datetime_beg: string;
    link: string;
    description: string;
    image: File | null;
    tag_ids: number[];
}

const baseValues: FormDataState = {
    title: '',
    datetime_beg: '',
    link: '',
    description: '',
    image: null,
    tag_ids: []
};

export function EditMeetup(): JSX.Element {
    const { t } = useTranslation();
    const { token, userID, role } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const axios = useAxiosWithAuth();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [serverValues, setServerValues] = useState<FormDataState | null>(null);
    const [userValues, setUserValues] = useState<Partial<FormDataState>>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [tagsLoading, setTagsLoading] = useState(true);

    const finalValues: FormDataState = {
        ...baseValues,
        ...serverValues,
        ...userValues
    };

    const [isPending, setIsPending] = useState<
        'deleting' | 'saving' | 'global' | false
    >(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            navigate(SIGN_IN);
        }
    }, [token, navigate]);

    // Fetch tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get(TAGS_API_URL);
                setAllTags(response.data);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                setAllTags([]);
            } finally {
                setTagsLoading(false);
            }
        };

        fetchTags();
    }, []);

    useEffect(() => {
        const fetchMeetupDetails = async () => {
            setIsPending('global');
            try {
                const response = await axios.get(`${MEETINGS_API_URL}${id}/`);
                const data = response.data;
                console.log('Fetched meetup data:', data);

                if (data.author_id !== userID && role !== 'admin') {
                    console.log('Redirecting to sign In because of ID mismatch');
                    await navigate(SIGN_IN);
                    return;
                }

                setServerValues({
                    title: data.title || '',
                    datetime_beg: new Date(data.datetime_beg)
                        .toISOString()
                        .slice(0, 16),
                    description: data.description || '',
                    link: data.link || '',
                    image: null,
                    tag_ids: data.tags?.map((tag: Tag) => tag.id) || []
                });

                setPreviewUrl(data.image || null);
            } catch (err: any) {
                //setError(err.message || 'Failed to fetch meetup details.');
                const errorDescription = getErrorDescription(
                    err,
                    'Failed to fetch meetup'
                );
                console.error('Error fetching meetup:', errorDescription);
                setError(err?.status + ' ' + errorDescription);
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

    const handleTagsChange = useCallback((selectedTags: Tag[]) => {
        const tagIds = selectedTags.map(tag => tag.id);
        setUserValues(prev => ({ ...prev, tag_ids: tagIds }));
    }, []);

    // Get selected tags from finalValues.tag_ids
    const selectedTags = finalValues.tag_ids
        .map(id => allTags.find(tag => tag.id === id))
        .filter((tag): tag is Tag => tag !== undefined);

    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsPending('saving');

        try {
            const formDataToSend = new FormData();

            Object.entries(userValues).forEach(([key, value]) => {
                console.log(key, value);
                if (key === 'tag_ids') {
                    // Append each tag ID separately
                    (value as number[]).forEach(id => {
                        formDataToSend.append('tag_ids', String(id));
                    });
                } else {
                    const tempValue = value === null ? '' : value;
                    formDataToSend.append(key, tempValue as any);
                }
            });
            console.log([...formDataToSend]);

            await axios.patch(`${MEETINGS_API_URL}${id}/`, formDataToSend);

            navigate(`${MEETUP_DETAILS}/${id}`);
        } catch (error: any) {
            const errorDescription = getErrorDescription(error);
            console.error('Error updating meetup:', errorDescription);
            setError(errorDescription || 'Failed to update meetup.');
        } finally {
            setIsPending(false);
        }
    };

    const handleDeleteMeetup = async () => {
        setIsPending('deleting');
        try {
            await axios.delete(`${MEETINGS_API_URL}${id}/`);
            navigate(`${BASE}/`);
        } catch (error: any) {
            setError(error.message || 'Failed to delete meetup.');
            setIsDeleteModalOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    if (isPending && !serverValues) return <Loader />;
    console.log(error, serverValues);
    // if (serverValues) return <p>{t('meetupDetails.noData')}</p>;

    return (
        <div className="edit-meetup create-meetup">
            <h1>{t('editMeetup.title')}</h1>
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleEditSubmit} className="create-meetup-form">
                <div className="input-group">
                    <label htmlFor="title">{t('editMeetup.titleLabel')}</label>
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
                    <label htmlFor="datetime_beg">
                        {t('editMeetup.startDateTime')}
                    </label>
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
                    <label htmlFor="link">{t('editMeetup.linkLabel')}</label>
                    <input
                        type="url"
                        id="link"
                        name="link"
                        value={finalValues.link}
                        onChange={handleChange}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="description">
                        {t('editMeetup.descriptionLabel')}
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={finalValues.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>{t('editMeetup.tagsLabel') || 'Tags'}</label>
                    {tagsLoading ? (
                        <p>Loading tags...</p>
                    ) : (
                        <TagSelector
                            tags={allTags}
                            selectedTags={selectedTags}
                            onTagsChange={handleTagsChange}
                            maxTags={5}
                        />
                    )}
                </div>

                <div className="image-upload-wrapper">
                    <label
                        htmlFor="customFileInput"
                        className="custom-file-label edit-meetup-button create-meeting-button w-full"
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
                    <div className="w-full">
                        <div className="preview-box">
                            <ImagePreview
                                previewUrl={previewUrl}
                                onRemove={handleRemoveImage}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className="form-actions"
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '20px',
                        justifyContent: 'space-between'
                    }}
                >
                    <button
                        type="submit"
                        className="edit-meetup-button create-meeting-button"
                        style={{ width: '100%' }}
                    >
                        {isPending === 'saving' ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="delete-button"
                    >
                        {isPending === 'deleting' ? 'Deleting...' : 'Delete Meetup'}
                    </button>
                </div>
            </form>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                title={t('editMeetup.deleteMeetupTitle')}
                description={t('editMeetup.deleteConfirmation')}
                onConfirm={handleDeleteMeetup}
                confirmText={t('editMeetup.deleteButton')}
                cancelText={t('buttons.cancel')}
            />
        </div>
    );
}
