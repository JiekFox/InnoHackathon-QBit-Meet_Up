import { useNavigate } from 'react-router';
import { CREATE_MEETUPS } from '../../constant/router';

export default function IntroSection() {
    const navigate = useNavigate();
    return (
        <section className="intro">
            <h2 className="title">Public MeetUps!</h2>
            <p className="description">
                Here you can find Meetings available to everyone that you can make an
                assignment for
            </p>
            <button
                className="create-meeting-button"
                onClick={() => {
                    navigate(CREATE_MEETUPS);
                }}
            >
                Create
            </button>
        </section>
    );
}
