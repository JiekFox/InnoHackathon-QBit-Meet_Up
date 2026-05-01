import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal = ({
    isOpen,
    setIsOpen,
    title,
    description = 'After saving, this action is irreversible.',
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: ConfirmationModalProps): JSX.Element | null => {
    const { t } = useTranslation();
    const displayDescription =
        description === 'After saving, this action is irreversible.'
            ? t('confirmationModal.defaultDescription')
            : description;
    const displayConfirmText =
        confirmText === 'Confirm' ? t('confirmationModal.confirm') : confirmText;
    const displayCancelText =
        cancelText === 'Cancel' ? t('confirmationModal.cancel') : cancelText;
    if (!isOpen) return null;

    const handleClose = () => {
        if (onCancel) {
            onCancel();
        }
        setIsOpen(false);
    };

    const handleConfirmWrapper = () => {
        onConfirm();
        setIsOpen(false);
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                    className="modal-close-x"
                    onClick={handleClose}
                    aria-label="Close modal"
                >
                    ×
                </button>

                <h3 className="modal-title">{title}</h3>
                <p className="modal-description">{displayDescription}</p>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="modal-btn cancel-btn"
                        onClick={handleClose}
                    >
                        {displayCancelText}
                    </button>
                    <button
                        type="button"
                        className="modal-btn confirm-btn"
                        onClick={handleConfirmWrapper}
                    >
                        {displayConfirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
