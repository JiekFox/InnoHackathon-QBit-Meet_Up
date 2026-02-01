import React from 'react';
import { NavLink } from 'react-router-dom';
import icon from '../assets/img/icon.png';
import { formatDate } from '../utils/formatDate';

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
        const dateStr = dateTime || datetime_beg || '';
        const formattedDate = formatDate(dateStr, {
            dateOnly: true,
            format: 'short'
        });

        return (
            <div className="meetup-card">
                <NavLink to={to}>
                    <img className="image" src={image || icon} alt="Meetup Image" />
                    <h3 className="title">{title}</h3>
                    <h4>{formattedDate}</h4>
                    <p className="description">{description}</p>
                </NavLink>
            </div>
        );
    }
);

export default MeetupCard;
