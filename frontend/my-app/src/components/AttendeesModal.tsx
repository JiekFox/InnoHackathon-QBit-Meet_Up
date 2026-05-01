import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAttendees, Attendee } from '../utils/hooks/useAttendees';
import { USERS_DETAIL } from '../constant/router';
import { useTranslation } from 'react-i18next';
import Loader from './Loader';
import icon from '../assets/img/icon.png';

interface AttendeesModalProps {
    isOpen: boolean;
    meetupId: string | undefined;
    onClose: () => void;
}

const AttendeesModal: React.FC<AttendeesModalProps> = ({
    isOpen,
    meetupId,
    onClose
}) => {
    const { t } = useTranslation();
    const { attendees, loading, error } = useAttendees(
        isOpen ? meetupId : undefined
    );

    if (!isOpen) return null;

    return (
        <div className="attendees-modal-overlay" onClick={onClose}>
            <div className="attendees-modal" onClick={e => e.stopPropagation()}>
                <div className="attendees-modal-header">
                    <h2>{t('meetupDetails.attendees')}</h2>
                    <button
                        className="attendees-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="attendees-modal-content">
                    {loading && <Loader />}
                    {error && (
                        <p className="error">
                            {t('common.error')}: {error}
                        </p>
                    )}
                    {!loading && !error && attendees.length === 0 && (
                        <p className="no-attendees">
                            {t('meetupDetails.noAttendees')}
                        </p>
                    )}
                    {!loading && !error && attendees.length > 0 && (
                        <div className="attendees-list">
                            {attendees.map((attendee: Attendee) => (
                                <NavLink
                                    key={attendee.id}
                                    to={`${USERS_DETAIL}/${attendee.id}`}
                                    className="attendee-item"
                                    onClick={onClose}
                                >
                                    <img
                                        src={attendee.photo || icon}
                                        alt={attendee.username}
                                        className="attendee-avatar"
                                    />
                                    <div className="attendee-info">
                                        <div className="attendee-username">
                                            {attendee.username}
                                        </div>
                                        <p className="attendee-name">
                                            {`${attendee.first_name} ${attendee.last_name}`}
                                        </p>
                                        {attendee.user_description && (
                                            <p className="attendee-description">
                                                {attendee.user_description}
                                            </p>
                                        )}
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendeesModal;
