import { useParams } from "react-router-dom";

export default function MeetupDetails() {
    const { id } = useParams();

    return (
        <main className="main-content">
            <h1 className="meetup-title">Meetup Details:</h1>
            <div className="meetup-info">
                <p>Meeting ID: {id}</p>
                <p>Date: 02/02/2020</p>
                <p>Location: Some location</p>
                <p>Description: This meetup is all about discussing the future plans for our project. Join us for a productive session!</p>
            </div>
            <button className="join-meeting-button">Join Meeting</button>
        </main>
    );
}
