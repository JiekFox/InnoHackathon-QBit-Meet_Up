import React from 'react';
import './FieldError.css';

interface FieldErrorProps {
    error?: string | null;
    className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
    if (!error) return null;

    return <p className={`field-error ${className}`}>⚠️ {error}</p>;
};
