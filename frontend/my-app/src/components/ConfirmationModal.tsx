import React, { JSX } from 'react';

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
                <p className="modal-description">{description}</p>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="modal-btn cancel-btn"
                        onClick={handleClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className="modal-btn confirm-btn"
                        onClick={handleConfirmWrapper}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
