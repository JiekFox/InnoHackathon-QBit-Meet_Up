import React from 'react';
import { NavLink } from 'react-router-dom';
import icon from '../assets/img/icon.png';

interface MeetupCardProps {
    title: string;
    description: string;
    image?: string | null;
    dateTime?: string;
    datetime_beg?: string;
    to: string;
}

const MeetupCard: React.FC<MeetupCardProps> = React.memo(
    ({ title, description, image, dateTime, datetime_beg, to }) => {
        const date = new Date(dateTime || datetime_beg || '');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
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
