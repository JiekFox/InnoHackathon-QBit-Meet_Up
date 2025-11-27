import React, { JSX } from 'react';
import { NavLink, useParams, useNavigate, Link } from 'react-router-dom';
import { useMeetupDetails } from '../utils/hooks/useMeetupDetails';
import icon from '../assets/img/icon.png';
import { useAuth } from '../utils/AuthContext';
import { USERS_DETAIL, EDIT_MEETUP, SIGN_IN } from '../constant/router';
import Loader from '../components/Loader';

export default function MeetupDetails(): JSX.Element {
    const { userID } = useAuth();
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

    const renderActionButtons = () => {
        if (userID === meetup?.author_id) {
            return (
                <Link className="meetup-details-button" to={`${EDIT_MEETUP}/${id}`}>
                    Edit Meetup
                </Link>
            );
        }

        const canInteract = isFavorite !== null || pending;

        if (!canInteract) {
            return (
                <button onClick={() => navigate(SIGN_IN)} className="control-button">
                    Sign in to subscribe
                </button>
            );
        }

        if (pending) {
            return <div>loading...</div>;
        }

        if (isFavorite) {
            return (
                <button
                    className="meetup-details-button"
                    onClick={handleUnsubscribe}
                >
                    Unsubscribe
                </button>
            );
        }

        return (
            <button className="meetup-details-button" onClick={handleSignForMeeting}>
                Subscribe
            </button>
        );
    };

    if (loading) return <Loader />;
    if (error) return <p>Error: {error}</p>;
    if (!meetup) return <p>No meetup data.</p>;

    return (
        <main className="meetup-details">
            <div className="meetup-details-card">
                <div className="meetup-details-image">
                    <img src={meetup.image || icon} alt="Meetup" />
                </div>
                <div className="meetup-details-content">
                    <h1 className="meetup-details-title">
                        {meetup.title || 'Untitled Meetup'}
                    </h1>
                    <h2 className="meetup-details-author">
                        Author:{' '}
                        {meetup.author_id && meetup.author ? (
                            <NavLink to={`${USERS_DETAIL}/${meetup.author_id}`}>
                                {meetup.author}
                            </NavLink>
                        ) : (
                            'Unknown'
                        )}
                    </h2>
                    <p className="meetup-details-date">
                        Link:{' '}
                        <a href={meetup.link} className="link">
                            {meetup.link}
                        </a>
                    </p>
                    <p className="meetup-details-date">{`Date begin: ${formattedDate}`}</p>
                    <p className="meetup-details-signed">{`Already signed: ${meetup.attendees_count || 0}`}</p>
                    <h3>Description:</h3>
                    <pre className="meetup-details-description">
                        {meetup.description || 'No description available.'}
                    </pre>
                </div>
                {renderActionButtons()}
            </div>
        </main>
    );
}
