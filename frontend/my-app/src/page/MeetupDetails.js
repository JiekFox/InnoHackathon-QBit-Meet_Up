import React from 'react';
import { useParams } from 'react-router-dom';
import { useMeetupDetails } from '../utils/hooks/useMeetupDetails';
import icon from '../assets/img/icon.png';
import { useAuth } from '../utils/AuthContext';

export default function MeetupDetails() {
    const { token } = useAuth();
    const { id } = useParams();
    const { meetup, loading, error, handleSignForMeeting, formattedDate } =
        useMeetupDetails(id);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

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
                        {`Author: ${meetup.author || 'Unknown'}`}
                    </h2>
                    <p className="meetup-details-date">
                        {`Date begin: ${formattedDate}`}
                    </p>
                    <p className="meetup-details-signed">
                        {`Already signed: ${meetup.signed || 0}`}
                    </p>
                    <h3>Description:</h3>
                    <pre className="meetup-details-description">
                        {meetup.description || 'No description available.'}
                    </pre>
                </div>
                <button
                    className="meetup-details-button"
                    onClick={handleSignForMeeting}
                >
                    {token ? 'Subscribe' : 'Sign for meeting'}
                </button>
            </div>
        </main>
    );
}
