import { NavLink } from 'react-router-dom';

export default function MeetupCard({ title, description, image, to }) {
    return (
        <NavLink to={to}>
            <div className="meetup-card">
                <img className="image" src={image} alt="Meetup Image" />
                <h3 className="title">{title}</h3>
                <p className="description">{description}</p>
            </div>
        </NavLink>
    );
}
