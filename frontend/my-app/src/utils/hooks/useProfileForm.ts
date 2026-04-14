import { useCallback, useEffect, useMemo, useState } from 'react';
import { USER_API_URL } from '../../constant/apiURL';
import { useAuth } from '../AuthContext';
import { useAxiosWithAuth } from './useAxiosWithAuth';
import { ProfileFormData } from '../../constant/types';
import { getErrorDescription } from '..';
import {
    validateUsername,
    validateUserEmail,
    validateFirstName,
    validateLastName,
    validateUserDescription,
    ValidationError,
    getFieldError as getValidationFieldError
} from '../validators';

export interface ProfileFormErrors {
    email?: string[];
    username?: string[];
    global?: string;
}

const baseValues: ProfileFormData = {
    name: '',
    surname: '',
    email: '',
    about: '',
    username: '',
    tg_id: '',
    teams_id: '',
    photo: null
};

export const useProfileForm = () => {
    const { token, userID, saveDate } = useAuth();
    const axios = useAxiosWithAuth();

    const [serverValues, setServerValues] = useState<ProfileFormData | null>(null);
    const [userValues, setUserValues] = useState<Partial<ProfileFormData>>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<ProfileFormErrors>({});
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [loading, setLoading] = useState(false);
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
        (fieldName: string, value: string) => {
            let error: string | null = null;

            switch (fieldName) {
                case 'username':
                    error = validateUsername(value);
                    break;
                case 'email':
                    error = validateUserEmail(value);
                    break;
                case 'name':
                    error = validateFirstName(value);
                    break;
                case 'surname':
                    error = validateLastName(value);
                    break;
                case 'about':
                    error = validateUserDescription(value);
                    break;
            }

            updateFieldError(fieldName, error);
            return error;
        },
        [updateFieldError]
    );

    // Validation helper: Validate all fields
    const validateAllFields = useCallback((): boolean => {
        const validationErrors: ValidationError[] = [];

        if (finalValues.username) {
            const usernameErr = validateUsername(finalValues.username);
            if (usernameErr)
                validationErrors.push({ field: 'username', message: usernameErr });
        }

        if (finalValues.email) {
            const emailErr = validateUserEmail(finalValues.email);
            if (emailErr)
                validationErrors.push({ field: 'email', message: emailErr });
        }

        if (finalValues.name) {
            const nameErr = validateFirstName(finalValues.name);
            if (nameErr) validationErrors.push({ field: 'name', message: nameErr });
        }

        if (finalValues.surname) {
            const surnameErr = validateLastName(finalValues.surname);
            if (surnameErr)
                validationErrors.push({ field: 'surname', message: surnameErr });
        }

        if (finalValues.about) {
            const aboutErr = validateUserDescription(finalValues.about);
            if (aboutErr)
                validationErrors.push({ field: 'about', message: aboutErr });
        }

        setFieldErrors(validationErrors);
        return validationErrors.length === 0;
    }, [finalValues]);

    const finalValues: ProfileFormData = useMemo(() => {
        return {
            ...baseValues,
            ...serverValues,
            ...userValues
        };
    }, [serverValues, userValues]);

    const handlePhotoDelete = () => {
        setPhotoPreview(null);

        setUserValues(prev => ({ ...prev, photo: '' }));
    };

    const fetchUserData = useCallback(async () => {
        if (!token?.access) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${USER_API_URL}${userID}/`);

            setServerValues({
                name: data.first_name || '',
                surname: data.last_name || '',
                email: data.email || '',
                about: data.user_description || '',
                username: data.username || '',
                tg_id: data.tg_id || '',
                teams_id: data.teams_id || '',
                photo: null
            });

            if (data.photo) setPhotoPreview(data.photo);
        } catch (error: any) {
            //!!Check it
            setErrors(errors => Object.assign({ global: error.message }, errors));
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [token, userID]);

    useEffect(() => {
        if (token?.access) fetchUserData();
    }, [fetchUserData, token]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setUserValues(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        updateFieldError(name, null);
    };

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUserValues(prev => ({ ...prev, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSave = useCallback(async () => {
        if (!token?.access) return;

        // Validate all fields before submission
        if (!validateAllFields()) {
            return;
        }

        const formDataToSend = new FormData();
        setLoading(true);
        Object.entries(userValues).forEach(([key, value]) => {
            formDataToSend.append(
                key === 'name'
                    ? 'first_name'
                    : key === 'surname'
                      ? 'last_name'
                      : key === 'about'
                        ? 'user_description'
                        : key,
                value as any
            );
        });
        console.log([...formDataToSend]);
        try {
            console.log([...formDataToSend]);
            const response = await axios.patch(
                `${USER_API_URL}${userID}/`,
                formDataToSend
            );
            console.log(response);
            const forSaveDate = {
                username: response.data.username,
                user_id: response.data.id,
                photo: response.data.photo,
                refresh: response.data?.token?.refresh ?? token.refresh,
                access: response.data?.token?.access ?? token.access
            };
            saveDate(forSaveDate);
            setErrors({});
            // alert('Profile updated successfully!');
        } catch (error: any) {
            console.error(error.message);
            const errorDescription = getErrorDescription(error, 'Invalid data.');
            console.error('Profile form:', errorDescription);
            setErrorMessage(errorDescription);
        } finally {
            setLoading(false);
        }
    }, [userValues, token, userID, validateAllFields]);

    return {
        finalValues,
        userValues,
        photoPreview,
        errors,
        errorMessage,
        loading,
        fieldErrors,
        getFieldError: (fieldName: string) =>
            getValidationFieldError(fieldErrors, fieldName),
        handlePhotoDelete,
        handleChange,
        handleBlur,
        handlePhotoUpload,
        handleSave,
        validateField
    };
};
