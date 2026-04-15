import React from 'react';
import { useTranslation } from 'react-i18next';

interface FieldErrorProps {
    error?: string | null;
    className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
    const { t } = useTranslation();

    if (!error) return null;

    const translatedError = t('errors.' + error, { defaultValue: error });

    return <p className={`field-error ${className}`}>⚠️ {translatedError}</p>;
};
