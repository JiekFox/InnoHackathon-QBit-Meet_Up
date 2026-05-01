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
import { FieldError } from '../components/FieldError';
import { FormDataState, useEditMeetupForm } from '../utils/hooks/useEditMeetupForm';
import { useTranslation } from 'react-i18next';
import TagSelector, { Tag } from '../components/TagSelector';
import { getErrorDescription } from '../utils';

const baseValues: FormDataState = {
    title: '',
    datetime_beg: '',
    duration: '1',
    link: '',
    location: '',
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
    const {
        fieldErrors,
        getFieldError,
        validateAllFields,
        updateFieldError,
        validateField
    } = useEditMeetupForm();

    useEffect(() => {
        if (!token) {
            navigate(SIGN_IN);
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get(TAGS_API_URL);
                setAllTags(response.data);
            } catch (err: any) {
                console.error('Failed to fetch tags:', err);
                setAllTags([]);
                const errorDescription = getErrorDescription(
                    err,
                    'Failed to fetch tags'
                );

                if (err?.status) {
                    setError(err?.status + ' ' + errorDescription);
                } else {
                    setError(errorDescription);
                }
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
                    duration: String(data.duration ?? ''),
                    description: data.description || '',
                    link: data.link || '',
                    location: data.location || '',
                    image: null,
                    tag_ids: data.tags?.map((tag: Tag) => tag.id) || []
                });

                setPreviewUrl(data.image || null);
            } catch (err: any) {
                const errorDescription = getErrorDescription(
                    err,
                    'Failed to fetch meetup'
                );
                console.error('Error fetching meetup:', errorDescription);
                if (err?.status) {
                    setError(err?.status + ' ' + errorDescription);
                } else {
                    setError(errorDescription);
                }
            } finally {
                setIsPending(false);
            }
        };

        fetchMeetupDetails();
    }, [id]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            if (name === 'duration') {
                const sanitized = value.replace(/[^0-9]/g, '');
                setUserValues(prev => ({ ...prev, [name]: sanitized }));
            } else {
                setUserValues(prev => ({ ...prev, [name]: value }));
            }
            // Clear error when user starts typing
            updateFieldError(name, null);
        },
        [updateFieldError]
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            validateField(name, value);
        },
        [validateField]
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

    const selectedTags = finalValues.tag_ids
        .map(id => allTags.find(tag => tag.id === id))
        .filter((tag): tag is Tag => tag !== undefined);

    const handleEditSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validate all fields before submission
        if (!validateAllFields(finalValues)) {
            return;
        }

        setIsPending('saving');

        try {
            const formDataToSend = new FormData();

            Object.entries(userValues).forEach(([key, value]) => {
                console.log(key, value);
                if (key === 'tag_ids') {
                    (value as number[]).forEach(id => {
                        formDataToSend.append('tag_ids', String(id));
                    });
                } else if (key === 'duration') {
                    const tempValue = value === null ? '' : String(value);
                    const durationNum = Number.parseFloat(
                        tempValue.replace(/,/g, '.')
                    );
                    const durationForApi = Number.isFinite(durationNum)
                        ? Math.round(durationNum)
                        : 0;
                    formDataToSend.append('duration', String(durationForApi));
                } else {
                    const tempValue = value === null ? '' : value;
                    formDataToSend.append(key, tempValue as any);
                }
            });
            console.log('sent date', [...formDataToSend]);

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
    // console.log(error, serverValues);
    // if (serverValues) return <p>{t('meetupDetails.noData')}</p>;

    return (
        <div className="edit-meetup create-meetup">
            <h1>{t('editMeetup.title')}</h1>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleEditSubmit} className="create-meetup-form">
                <div className="input-group">
                    <label htmlFor="title">{t('editMeetup.titleLabel')}</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={finalValues.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    <FieldError error={getFieldError('title')} />
                </div>

                <div className="input-row">
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
                            onBlur={handleBlur}
                            required
                        />
                        <FieldError error={getFieldError('datetime_beg')} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="duration">
                            {t('editMeetup.durationLabel')}
                        </label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            value={finalValues.duration}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="0"
                            step="1"
                            required
                        />
                        <FieldError error={getFieldError('duration')} />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="link">{t('editMeetup.linkLabel')}</label>
                    <input
                        type="url"
                        id="link"
                        name="link"
                        value={finalValues.link}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    <FieldError error={getFieldError('link')} />
                </div>

                <div className="input-group">
                    <label htmlFor="location">{t('editMeetup.locationLabel')}</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={finalValues.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={t('editMeetup.locationPlaceholder')}
                        required
                    />
                    <FieldError error={getFieldError('location')} />
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
                        onBlur={handleBlur}
                        required
                    />
                    <FieldError error={getFieldError('description')} />
                </div>

                <div className="input-group">
                    <label>{t('editMeetup.tagsLabel') || 'Tags'}</label>
                    {tagsLoading ? (
                        <p>{t('common.loading')}</p>
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
                        {t('createMeetup.selectImage')}
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
                        disabled={isPending !== false || fieldErrors.length > 0}
                    >
                        {isPending === 'saving'
                            ? t('buttons.loading')
                            : t('profile.saveButton')}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="delete-button"
                    >
                        {isPending === 'deleting'
                            ? t('buttons.loading')
                            : t('editMeetup.deleteMeetupTitle')}
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
