import React from 'react';
import { useTranslation } from 'react-i18next';

interface LogoutModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onClose, onConfirm }) => {
    const { t } = useTranslation();

    return (
        <div className="logout-modal">
            <div className="modal-content">
                <span className="modal-close" onClick={onClose}>
                    &times;
                </span>
                <h2>{t('logoutModal.title')}</h2>
                <p>{t('logoutModal.message')}</p>
                <div className="modal-buttons">
                    <button className="button-decline" onClick={onClose}>
                        {t('logoutModal.cancel')}
                    </button>
                    <button className="button-confirm" onClick={onConfirm}>
                        {t('logoutModal.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
