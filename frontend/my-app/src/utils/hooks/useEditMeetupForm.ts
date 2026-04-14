import { useState, useCallback } from 'react';
import {
    validateMeetingTitle,
    validateMeetingDescription,
    validateMeetingLink,
    validateMeetingDateTime,
    validateMeetingDuration,
    ValidationError,
    getFieldError
} from '../validators';

export interface FormDataState {
    title: string;
    datetime_beg: string;
    duration: string;
    link: string;
    description: string;
    image: File | null;
    tag_ids: number[];
}

export const useEditMeetupForm = () => {
    const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([]);

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
    const validateAllFields = useCallback((formData: FormDataState): boolean => {
        const errors: ValidationError[] = [];

        const titleErr = validateMeetingTitle(formData.title);
        if (titleErr) errors.push({ field: 'title', message: titleErr });

        const descErr = validateMeetingDescription(formData.description);
        if (descErr) errors.push({ field: 'description', message: descErr });

        const linkErr = validateMeetingLink(formData.link);
        if (linkErr) errors.push({ field: 'link', message: linkErr });

        const durationErr = validateMeetingDuration(formData.duration);
        if (durationErr) errors.push({ field: 'duration', message: durationErr });

        const dateTimeErr = validateMeetingDateTime(formData.datetime_beg);
        if (dateTimeErr)
            errors.push({ field: 'datetime_beg', message: dateTimeErr });

        setFieldErrors(errors);
        return errors.length === 0;
    }, []);

    return {
        fieldErrors,
        getFieldError: (fieldName: string) => getFieldError(fieldErrors, fieldName),
        validateField,
        validateAllFields,
        updateFieldError
    };
};
