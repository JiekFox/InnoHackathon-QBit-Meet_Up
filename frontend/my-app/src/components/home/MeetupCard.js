import { NavLink } from 'react-router-dom';

export default function MeetupCard({ title, description, image, dateTime, to }) {
    const date = new Date(dateTime);

    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    console.log(image);
    return (
        <NavLink to={to}>
            <div className="meetup-card">
                <img className="image" src={image} alt="Meetup Image" />
                <h3 className="title">{title}</h3>
                <h4>{`${day}.${month}.${year}`}</h4>
                <p className="description">{description}</p>
            </div>
        </NavLink>
    );
}
