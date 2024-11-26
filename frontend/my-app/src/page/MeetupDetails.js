import { useParams } from "react-router-dom";
import useFetchMeetings from "../api/useFetchMeetings";
import icon from '../assets/img/icon.png'
export default function MeetupDetails() {
  const { id } = useParams();
  const { data: meetup, loading, error } = useFetchMeetings(
    `https://innohackathon-qbit-meet-up.onrender.com/api/meetings/${id}/`
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="meetup-details">
      <div className="meetup-details-card">
        <div className="meetup-details-image">
          <img
            src={meetup.image || icon}
            alt="Meetup"
          />
        </div>
        <div className="meetup-details-content">
          <h1 className="meetup-details-title">{meetup.title || "Untitled Meetup"}</h1>
          <h2 className="meetup-details-author">{`Author: ${meetup.author || "Unknown"}`}</h2>
          <p className="meetup-details-date">{`Date begin: ${meetup.date || "Not specified"}`}</p>
          <p className="meetup-details-signed">{`Already signed: ${meetup.signed || 0}`}</p>
          <h3>Description:</h3>
          <p className="meetup-details-description">{meetup.description || "No description available."}</p>
        </div>
        <button className="meetup-details-button">Sign for meeting</button>
      </div>
    </main>
  );
}
