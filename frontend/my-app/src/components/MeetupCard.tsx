import React from 'react';
import { NavLink } from 'react-router-dom';
import icon from '../assets/img/icon.png';
import { formatDate } from '../utils/formatDate';
import { Tag } from '../constant/types';
import { useTranslation } from 'react-i18next';

interface MeetupCardProps {
    title: string;
    description: string;
    image?: string | null;
    dateTime?: string;
    datetime_beg?: string;
    to: string;
    tags?: Tag[];
    duration?: number;
}

const MeetupCard: React.FC<MeetupCardProps> = React.memo(
    ({ title, description, image, dateTime, datetime_beg, to, tags, duration }) => {
        const { t } = useTranslation();
        const dateStr = dateTime || datetime_beg || '';
        const formattedDate = formatDate(dateStr, {
            dateOnly: false,
            format: 'short'
        });

        return (
            <div className="meetup-card">
                <NavLink to={to}>
                    <img className="image" src={image || icon} alt="Meetup Image" />
                    {tags && tags.length > 0 && (
                        <div className="card-tags">
                            {tags.map(tag => (
                                <span
                                    key={tag.id}
                                    className="tag-badge"
                                    style={{ backgroundColor: tag.color }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                    <h3 className="title">{title}</h3>
                    <div className="date-time">
                        <span>{formattedDate}</span>
                        <span>
                            ⏱ {duration} {t('common.hours')}
                        </span>
                    </div>

                    <p className="description">{description}</p>
                </NavLink>
            </div>
        );
    }
);

export default MeetupCard;
