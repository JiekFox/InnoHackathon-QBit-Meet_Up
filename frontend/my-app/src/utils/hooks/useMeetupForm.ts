import { useState, useCallback, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AxiosError, AxiosResponse } from 'axios';
import { MEETINGS_API_URL, GPT_URL, TAGS_API_URL } from '../../constant/apiURL';
import { MEETUP_DETAILS, SIGN_IN } from '../../constant/router';
import { useAuth } from '../AuthContext';
import { Meetup } from '../../constant/types';
import { useAxiosWithAuth } from './useAxiosWithAuth';
import { getErrorDescription } from '../index';
import {
    validateMeetingTitle,
    validateMeetingDescription,
    validateMeetingLink,
    validateMeetingLocation,
    validateMeetingDuration,
    validateMeetingDateTime,
    ValidationError,
    getFieldError
} from '../validators';

export interface Tag {
    id: number;
    name: string;
    slug: string;
    color: string;
}

export interface MeetupFormData {
    title: string;
    datetime_beg: string;
    duration: number | string;
    link: string;
    description: string;
    image: File | null;
    tag_ids: number[];
}

export interface ApiError {
    [key: string]: string[] | string;
}

export const useMeetupForm = () => {
    const { token, userID } = useAuth();
    const navigate = useNavigate();
    const axios = useAxiosWithAuth();

    const [formData, setFormData] = useState<MeetupFormData>({
        title: '',
        datetime_beg: '',
        duration: 1,
        link: '',
        description: '',
        image: null,
        tag_ids: []
    });
    const [error, setError] = useState<string | ApiError | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([]);

    // Tags state
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [tagsLoading, setTagsLoading] = useState(true);

    // AI response state
    const [aiResponse, setAiResponse] = useState<string>('');
    const [isAiResponseVisible, setIsAiResponseVisible] = useState(false);
    const [isPendingAI, setIsPendingAI] = useState(false);

    // Validation helper: Update field error
    const updateFieldError = useCallback(
        (fieldName: string, errorMessage: string | null) => {
            setFieldErrors(prev => {
                const filtered = prev.filter(e => e.field !== fieldName);
                if (errorMessage) {
                    return [
                        ...filtered,
                        { field: fieldName, message: errorMessage }
                    ];
                }
                return filtered;
            });
        },
        []
    );

    // Validation helper: Validate single field on blur
    const validateField = useCallback(
        (fieldName: string, value: string | number) => {
            let error: string | null = null;

            switch (fieldName) {
                case 'title':
                    error = validateMeetingTitle(String(value));
                    break;
                case 'description':
                    error = validateMeetingDescription(String(value));
                    break;
                case 'link':
                    error = validateMeetingLink(String(value));
                    break;
                case 'location':
                    error = validateMeetingLocation(String(value));
                    break;
                case 'duration':
                    error = validateMeetingDuration(value);
                    break;
                case 'datetime_beg':
                    error = validateMeetingDateTime(String(value));
                    break;
            }

            updateFieldError(fieldName, error);
            return error;
        },
        [updateFieldError]
    );

    // Validation helper: Validate all fields
    const validateAllFields = useCallback((): boolean => {
        const errors: ValidationError[] = [];

        const titleErr = validateMeetingTitle(formData.title);
        if (titleErr) errors.push({ field: 'title', message: titleErr });

        const descErr = validateMeetingDescription(formData.description);
        if (descErr) errors.push({ field: 'description', message: descErr });

        const linkErr = validateMeetingLink(formData.link);
        if (linkErr) errors.push({ field: 'link', message: linkErr });

        const locErr = validateMeetingLocation(formData.location);
        if (locErr) errors.push({ field: 'location', message: locErr });

        const durationErr = validateMeetingDuration(formData.duration);
        if (durationErr) errors.push({ field: 'duration', message: durationErr });

        const dateTimeErr = validateMeetingDateTime(formData.datetime_beg);
        if (dateTimeErr)
            errors.push({ field: 'datetime_beg', message: dateTimeErr });

        setFieldErrors(errors);
        return errors.length === 0;
    }, [formData]);

    // Fetch tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            console.log('Fetching tags from API...');
            try {
                const response = await axios.get(TAGS_API_URL);
                setAllTags(response.data);
            } catch (error) {
                const errorDescription = getErrorDescription(
                    error,
                    'Failed to fetch tags'
                );
                console.error('Failed to fetch tags:', errorDescription);
                setError(errorDescription);
                setAllTags([]);
            } finally {
                setTagsLoading(false);
            }
        };

        fetchTags();
    }, []);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev): MeetupFormData => {
                if (name === 'duration') {
                    const sanitized = value.replace(/[^0-9]/g, '');
                    return { ...prev, [name]: sanitized };
                }
                return { ...prev, [name]: value };
            });
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
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
        }
    }, []);

    const handleTagsChange = useCallback((selectedTags: Tag[]) => {
        const tagIds = selectedTags.map(tag => tag.id);
        setFormData(prev => ({ ...prev, tag_ids: tagIds }));
    }, []);

    const handleImproveWithAI = useCallback(
        async (description: string, t: (key: string) => string) => {
            if (!description) {
                alert(t('createMeetup.pleaseProvideDescription'));
                return;
            }

            setIsPendingAI(true);

            const gptPrompt = `
                Тебе дано краткое описание мероприятия: "${description}". 
                Твоя задача: расписать это описание больше объемом, сделать его структурированным и по пунктам. 
                Затем дай мне ответ СТРОГО В СЛЕДУЮЩЕМ ФОРМАТЕ: 
                "текст расширенного описания митапа, который ты придумаешь"
                Ничего больше добавлять не нужно. НЕ ПИШИ вводных слов, комментариев, заключений, либо других текстов вне указанного формата. ТОЛЬКО содержимое улучшенного описания. 
                ВАЖНО: ответ должен быть в пределах 480 символов. Если текст превышает это количество, сократи его.`;

            try {
                const gptResponse = await axios.post(
                    `${GPT_URL}/chatgpt`,
                    { message: gptPrompt },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const gptMessage: string | undefined =
                    gptResponse.data.choices[0]?.message?.content;

                if (!gptMessage) {
                    throw new Error('No content received from GPT.');
                }

                setAiResponse(gptMessage);
                setIsAiResponseVisible(true);
            } catch (error) {
                console.error('Error occurred while communicating with AI:', error);
                setError('AI: error' + error);
                // alert('Failed to communicate with AI.');
            } finally {
                setIsPendingAI(false);
            }
        },
        []
    );

    const handleAcceptAiSuggestion = useCallback(() => {
        if (aiResponse) {
            setFormData(prev => ({ ...prev, description: aiResponse }));
            setAiResponse('');
            setIsAiResponseVisible(false);
        }
    }, [aiResponse]);

    const dismissAiResponse = useCallback(() => {
        setAiResponse('');
        setIsAiResponseVisible(false);
    }, []);

    // Get selected tags from formData.tag_ids
    const selectedTags = formData.tag_ids
        .map(id => allTags.find(tag => tag.id === id))
        .filter((tag): tag is Tag => tag !== undefined);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!token) {
                navigate(SIGN_IN);
                return;
            }

            // Validate all fields before submission
            if (!validateAllFields()) {
                return;
            }

            const meetingData = new FormData();
            meetingData.append('title', formData.title);
            meetingData.append('author_id', String(userID));
            meetingData.append('datetime_beg', formData.datetime_beg);
            meetingData.append('link', formData.link);
            meetingData.append('description', formData.description);
            const durationNum = Number.parseInt(String(formData.duration || ''), 10);
            const durationForApi = Number.isFinite(durationNum) ? durationNum : 0;
            meetingData.append('duration', String(durationForApi));
            if (formData.image) {
                meetingData.append('image', formData.image);
            }
            formData.tag_ids.forEach(id => {
                meetingData.append('tag_ids', String(id));
            });

            try {
                setIsPending(true);
                const response: AxiosResponse<Meetup> = await axios.post(
                    MEETINGS_API_URL,
                    meetingData
                );
                navigate(`${MEETUP_DETAILS}/${response.data.id}`);
            } catch (err) {
                const errorDescription = getErrorDescription(
                    err,
                    'Failed to create meetup'
                );
                console.error('Error creating meeting:', errorDescription);
                setError(errorDescription);
            } finally {
                setIsPending(false);
            }
        },
        [formData, token, userID, navigate, axios, validateAllFields]
    );

    return {
        formData,
        error,
        fieldErrors,
        getFieldError: (fieldName: string) => getFieldError(fieldErrors, fieldName),
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
        isPending,
        validateField
    };
};
