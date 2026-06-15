/**
 * Frontend validation utilities matching backend constraints
 */

export interface ValidationError {
    field: string;
    message: string;
}

// Meeting Model Constraints
export const MEETING_CONSTRAINTS = {
    title: {
        maxLength: 50,
        required: true
    },
    description: {
        maxLength: 3000,
        required: true
    },
    link: {
        maxLength: 1000,
        required: false
    },
    location: {
        maxLength: 200,
        required: false
    },
    duration: {
        min: 0,
        required: true
    },
    datetime_beg: {
        required: true
    }
};

// UserProfile Model Constraints
export const USER_CONSTRAINTS = {
    username: {
        maxLength: 150,
        required: true,
        pattern: /^[\w@.+\-]+$/,
        patternMessage: 'Letters, digits and @/./+/-/_ only'
    },
    first_name: {
        maxLength: 150,
        required: false
    },
    last_name: {
        maxLength: 150,
        required: false
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Invalid email format'
    },
    user_description: {
        maxLength: 255,
        required: false
    }
};

// Generic validators
export const validateRequired = (
    value: string | File | null,
    fieldName: string
): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName}Required`;
    }
    return null;
};

export const validateMaxLength = (
    value: string,
    maxLength: number,
    fieldKey: string
): string | null => {
    if (value.length > maxLength) {
        return `${fieldKey}MaxLength`;
    }
    return null;
};

export const validatePattern = (
    value: string,
    pattern: RegExp,
    fieldName: string,
    message?: string
): string | null => {
    if (value && !pattern.test(value)) {
        return message || `${fieldName.toLowerCase()}Pattern`;
    }
    return null;
};

export const validateEmail = (email: string): string | null => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !pattern.test(email)) {
        return 'invalidEmailFormat';
    }
    return null;
};

export const validatePositiveInteger = (
    value: string | number,
    fieldKey: string
): string | null => {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(num) || num < 0) {
        return `${fieldKey}Positive`;
    }
    return null;
};

export const validateDateTime = (dateTimeString: string): string | null => {
    if (!dateTimeString) {
        return 'datetimeRequired';
    }
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
        return 'invalidDatetimeFormat';
    }
    if (date < new Date()) {
        return 'datetimeFuture';
    }
    return null;
};

// Meeting validators
export const validateMeetingTitle = (title: string): string | null => {
    if (!title.trim()) {
        return 'titleRequired';
    }
    return validateMaxLength(title, MEETING_CONSTRAINTS.title.maxLength, 'title');
};

export const validateMeetingDescription = (description: string): string | null => {
    if (!description.trim()) {
        return 'descriptionRequired';
    }
    return validateMaxLength(
        description,
        MEETING_CONSTRAINTS.description.maxLength,
        'description'
    );
};

export const validateMeetingLink = (link: string): string | null => {
    if (!link) return null; // Optional field
    const maxLengthErr = validateMaxLength(
        link,
        MEETING_CONSTRAINTS.link.maxLength,
        'link'
    );
    if (maxLengthErr) return maxLengthErr;

    // Basic URL validation
    if (link.trim()) {
        try {
            new URL(link);
        } catch {
            return 'invalidUrlFormat';
        }
    }
    return null;
};

export const validateMeetingLocation = (location: string): string | null => {
    if (!location) return 'locationRequired'; // Optional field
    return validateMaxLength(
        location,
        MEETING_CONSTRAINTS.location.maxLength,
        'location'
    );
};

export const validateMeetingDuration = (
    duration: string | number
): string | null => {
    return validatePositiveInteger(duration, 'duration');
};

export const validateMeetingDateTime = (dateTime: string): string | null => {
    return validateDateTime(dateTime);
};

export const validateMeetingForm = (formData: {
    title: string;
    description: string;
    link: string;
    location: string;
    duration: string | number;
    datetime_beg: string;
}): ValidationError[] => {
    const errors: ValidationError[] = [];

    const titleErr = validateMeetingTitle(formData.title);
    if (titleErr) errors.push({ field: 'title', message: titleErr });

    const descErr = validateMeetingDescription(formData.description);
    if (descErr) errors.push({ field: 'description', message: descErr });

    const linkErr = validateMeetingLink(formData.link);
    if (linkErr) errors.push({ field: 'link', message: linkErr });

    const locErr = validateRequired(formData.location, 'location');
    if (locErr) errors.push({ field: 'location', message: locErr });

    const durationErr = validateMeetingDuration(formData.duration);
    if (durationErr) errors.push({ field: 'duration', message: durationErr });

    const dateTimeErr = validateMeetingDateTime(formData.datetime_beg);
    if (dateTimeErr) errors.push({ field: 'datetime_beg', message: dateTimeErr });

    return errors;
};

// User validators
export const validateUsername = (username: string): string | null => {
    if (!username.trim()) {
        return 'usernameRequired';
    }
    const maxLengthErr = validateMaxLength(
        username,
        USER_CONSTRAINTS.username.maxLength,
        'username'
    );
    if (maxLengthErr) return maxLengthErr;

    const patternErr = validatePattern(
        username,
        USER_CONSTRAINTS.username.pattern,
        'username',
        'usernamePattern'
    );
    if (patternErr) return patternErr;

    return null;
};

export const validateUserEmail = (email: string): string | null => {
    if (!email.trim()) {
        return 'emailRequired';
    }
    return validateEmail(email);
};

export const validateFirstName = (firstName: string): string | null => {
    if (!firstName) return null; // Optional field
    return validateMaxLength(
        firstName,
        USER_CONSTRAINTS.first_name.maxLength,
        'firstName'
    );
};

export const validateLastName = (lastName: string): string | null => {
    if (!lastName) return null; // Optional field
    return validateMaxLength(
        lastName,
        USER_CONSTRAINTS.last_name.maxLength,
        'lastName'
    );
};

export const validateUserDescription = (description: string): string | null => {
    if (!description) return null; // Optional field
    return validateMaxLength(
        description,
        USER_CONSTRAINTS.user_description.maxLength,
        'userDescription'
    );
};

export const validateUserForm = (formData: {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_description?: string;
}): ValidationError[] => {
    const errors: ValidationError[] = [];

    const usernameErr = validateUsername(formData.username);
    if (usernameErr) errors.push({ field: 'username', message: usernameErr });

    const emailErr = validateUserEmail(formData.email);
    if (emailErr) errors.push({ field: 'email', message: emailErr });

    if (formData.first_name) {
        const firstNameErr = validateFirstName(formData.first_name);
        if (firstNameErr)
            errors.push({ field: 'first_name', message: firstNameErr });
    }

    if (formData.last_name) {
        const lastNameErr = validateLastName(formData.last_name);
        if (lastNameErr) errors.push({ field: 'last_name', message: lastNameErr });
    }

    if (formData.user_description) {
        const descErr = validateUserDescription(formData.user_description);
        if (descErr) errors.push({ field: 'user_description', message: descErr });
    }

    return errors;
};

// Password Validators
export const validatePassword = (password: string): string | null => {
    if (!password) {
        return 'passwordRequired';
    }
    if (password.length < 8) {
        return 'passwordMinLength';
    }
    return null;
};

// SignIn/SignUp Form Validators
export const validateSignInForm = (formData: {
    username: string;
    password: string;
}): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!formData.username.trim()) {
        errors.push({ field: 'username', message: 'usernameRequired' });
    }

    if (!formData.password) {
        errors.push({ field: 'password', message: 'passwordRequired' });
    }
    console.log('Sign-in form validation errors:', errors);
    return errors;
};

export const validateSignUpForm = (formData: {
    username: string;
    email: string;
    password: string;
}): ValidationError[] => {
    const errors: ValidationError[] = [];

    const usernameErr = validateUsername(formData.username);
    if (usernameErr) errors.push({ field: 'username', message: usernameErr });

    const emailErr = validateUserEmail(formData.email);
    if (emailErr) errors.push({ field: 'email', message: emailErr });

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) errors.push({ field: 'password', message: passwordErr });

    return errors;
};

// Helper to get field error
export const getFieldError = (
    errors: ValidationError[],
    fieldName: string
): string | null => {
    const error = errors.find(e => e.field === fieldName);
    return error ? error.message : null;
};

// Helper to check if form has errors
export const hasErrors = (errors: ValidationError[]): boolean => {
    return errors.length > 0;
};
