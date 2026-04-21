import { useMeetupForm } from '../utils/hooks/useMeetupForm';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SIGN_IN } from '../constant/router';
import { useEffect, useState, ChangeEvent, JSX, useRef } from 'react';
import { ImagePreview } from '../components/ImagePreview';
import TagSelector from '../components/TagSelector';
import { FieldError } from '../components/FieldError';
import { useTranslation } from 'react-i18next';

export function CreateMeetup(): JSX.Element {
    const { t } = useTranslation();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!token) {
            navigate(SIGN_IN);
        }
    }, [token, navigate]);

    const {
        formData,
        error,
        fieldErrors,
        getFieldError,
        allTags,
        tagsLoading,
        selectedTags,
        aiResponse,
        isAiResponseVisible,
        isPendingAI,
        handleChange,
        handleBlur,
        handleImageUpload,
        handleTagsChange,
        handleImproveWithAI,
        handleAcceptAiSuggestion,
        dismissAiResponse,
        handleSubmit,
        isPending
    } = useMeetupForm();

    const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            handleImageUpload(e);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        const syntheticEvent = {
            target: {
                name: 'image',
                files: null,
                value: ''
            }
        } as unknown as ChangeEvent<HTMLInputElement>;

        handleImageUpload(syntheticEvent);
    };

    const handleAIClick = () => {
        handleImproveWithAI(formData.description, t);
    };

    return (
        <div className="create-meetup">
            <h1>{t('createMeetup.title')}</h1>
            {error && <div className="error">{error.toString()}</div>}
            <form onSubmit={handleSubmit} className="create-meetup-form">
                <div className="input-group">
                    <label htmlFor="title">{t('createMeetup.titleLabel')}</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    <FieldError error={getFieldError('title')} />
                </div>
                <div className="input-row">
                    <div className="input-group">
                        <label htmlFor="datetime_beg">
                            {t('createMeetup.startDateTime')}
                        </label>
                        <input
                            type="datetime-local"
                            id="datetime_beg"
                            name="datetime_beg"
                            value={formData.datetime_beg}
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
                            value={formData.duration}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="1"
                            step="1"
                            required
                        />
                        <FieldError error={getFieldError('duration')} />
                    </div>
                </div>
                <div className="input-group">
                    <label htmlFor="link">{t('createMeetup.linkLabel')}</label>
                    <input
                        type="url"
                        id="link"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={t('createMeetup.linkPlaceholder')}
                    />
                    <FieldError error={getFieldError('link')} />
                </div>
                <div className="input-group">
                    <label htmlFor="location">
                        {t('createMeetup.locationLabel')}
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={t('createMeetup.locationPlaceholder')}
                        required
                    />
                    <FieldError error={getFieldError('location')} />
                </div>
                <div className="input-group">
                    <label htmlFor="description">
                        {t('createMeetup.descriptionLabel')}
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    <FieldError error={getFieldError('description')} />
                </div>

                <button
                    type="button"
                    className={`ai-button ${isPendingAI ? 'ai-loading' : ''}`}
                    onClick={handleAIClick}
                    disabled={isPendingAI}
                    style={{ height: 35 }}
                >
                    {isPendingAI
                        ? t('createMeetup.processingAI')
                        : t('createMeetup.improveWithAI')}
                </button>

                {isAiResponseVisible && (
                    <>
                        <div className="input-group">
                            <label>ИИ предложение:</label>
                            <textarea
                                id="ai-response"
                                value={aiResponse}
                                readOnly
                                className="ai-response-field"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                className="ai-button"
                                onClick={handleAcceptAiSuggestion}
                            >
                                {/* Accept AI Suggestion */}
                                Согласиться с текстом ИИ
                            </button>
                            <button
                                type="button"
                                className="ai-button"
                                onClick={dismissAiResponse}
                                style={{ backgroundColor: '#6c757d' }}
                            >
                                Отказаться от текста ИИ
                            </button>
                        </div>
                    </>
                )}

                <div className="input-group">
                    <label>{t('createMeetup.tagsLabel')}</label>
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
                        className="custom-file-label create-meetup-button w-full"
                        aria-label="select image"
                        tabIndex={0}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        {t('createMeetup.selectImage')}
                    </label>
                    <input
                        type="file"
                        id="customFileInput"
                        name="image"
                        accept="image/*"
                        onChange={onImageChange}
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

                <button
                    type="submit"
                    className="create-meetup-button"
                    disabled={isPending || fieldErrors.length > 0}
                >
                    {isPending
                        ? t('createMeetup.pending')
                        : t('createMeetup.submitButton')}
                </button>
            </form>
        </div>
    );
}
