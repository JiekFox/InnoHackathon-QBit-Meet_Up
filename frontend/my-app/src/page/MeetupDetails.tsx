import { JSX } from 'react';
import { NavLink, useParams, useNavigate, Link } from 'react-router-dom';
import { useMeetupDetails } from '../utils/hooks/useMeetupDetails';
import icon from '../assets/img/icon.png';
import { useAuth } from '../utils/AuthContext';
import { USERS_DETAIL, EDIT_MEETUP, SIGN_IN } from '../constant/router';
import Loader from '../components/Loader';
import { useTranslation } from 'react-i18next';

export default function MeetupDetails(): JSX.Element {
    const { userID, role } = useAuth();
    const { id } = useParams<{ id: string }>();
    const {
        meetup,
        loading,
        pending,
        error,
        handleSignForMeeting,
        handleUnsubscribe,
        isFavorite,
        formattedDate
    } = useMeetupDetails(id);
    const navigate = useNavigate();
    const { t } = useTranslation();
    console.log('Meetup details:', meetup);
    const renderActionButtons = () => {
        if (userID === meetup?.author_id || role === 'admin') {
            return (
                <Link className="meetup-details-button" to={`${EDIT_MEETUP}/${id}`}>
                    {t('meetupDetails.edit')}
                </Link>
            );
        }

        const canInteract = isFavorite !== null || pending;

        if (!canInteract) {
            return (
                <button onClick={() => navigate(SIGN_IN)} className="control-button">
                    {t('meetupDetails.signToSubscribe')}
                </button>
            );
        }

        if (pending) {
            return (
                <div>
                    <Loader />
                </div>
            );
        }

        if (isFavorite) {
            return (
                <button
                    className="meetup-details-button"
                    onClick={handleUnsubscribe}
                >
                    {t('meetupDetails.unsubscribe')}
                </button>
            );
        }

        return (
            <button className="meetup-details-button" onClick={handleSignForMeeting}>
                {t('meetupDetails.subscribe')}
            </button>
        );
    };

    if (loading) return <Loader />;
    if (error)
        return (
            <p>
                {t('common.error')}: {error}
            </p>
        );
    if (!meetup) return <p>{t('meetupDetails.noData')}</p>;

    return (
        <main className="meetup-details">
            <div className="meetup-details-card">
                <div className="meetup-details-image">
                    <img src={meetup.image || icon} alt="Meetup" />
                </div>
                <div className="meetup-details-content">
                    <h1 className="meetup-details-title">
                        {meetup.title || t('meetupDetails.title')}
                    </h1>
                    <h2 className="meetup-details-author">
                        {t('meetupDetails.author')}:
                        {meetup.author_id && meetup.author ? (
                            <NavLink to={`${USERS_DETAIL}/${meetup.author_id}`}>
                                {meetup.author}
                            </NavLink>
                        ) : (
                            t('common.error')
                        )}
                    </h2>
                    {meetup.tags && meetup.tags.length > 0 && (
                        <div className="meetup-details-tags">
                            {meetup.tags.map(tag => (
                                <span
                                    key={tag.id}
                                    className="tag-badge"
                                    style={{ backgroundColor: tag.color }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="meetup-details-date">
                        {t('meetupDetails.link')}:
                        <a href={meetup.link} className="link">
                            {meetup.link}
                        </a>
                    </p>
                    <p className="meetup-details-date">{`${t('meetupDetails.dateBegin')}: ${formattedDate}`}</p>
                    <p className="meetup-details-signed">{`${t('meetupDetails.alreadySigned')}: ${meetup.attendees_count || 0}`}</p>
                    <h3>{t('meetupDetails.description')}:</h3>
                    <pre className="meetup-details-description">
                        {meetup.description || t('meetupDetails.noData')}
                    </pre>
                </div>
                {renderActionButtons()}
            </div>
        </main>
    );
}
