import React from 'react';
import { NavLink } from 'react-router-dom';

const MeetupCard = React.memo(({ title, description, image, dateTime, to }) => {
    const date = new Date(dateTime);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    return (
        <div className="meetup-card">
            <NavLink to={to}>
                <img className="image" src={image} alt="Meetup Image" />
                <h3 className="title">{title}</h3>
                <h4>{`${day}.${month}.${year}`}</h4>
                <p className="description">{description}</p>
            </NavLink>
        </div>
    );
});

export default MeetupCard;
