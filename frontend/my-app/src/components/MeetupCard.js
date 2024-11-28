import React from 'react';
import { NavLink } from 'react-router-dom';
import icon from '../assets/img/icon.png';

const MeetupCard = React.memo(
    ({ title, description, image, dateTime, datetime_beg, to }) => {
        console.log(title, description, image, dateTime, to);
        const date = new Date(dateTime ? dateTime : datetime_beg);
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();

        return (
            <div className="meetup-card">
                <NavLink to={to}>
                    <img className="image" src={image || icon} alt="Meetup Image" />
                    <h3 className="title">{title}</h3>
                    <h4>{`${day}.${month}.${year}`}</h4>
                    <p className="description">{description}</p>
                </NavLink>
            </div>
        );
    }
);

export default MeetupCard;
