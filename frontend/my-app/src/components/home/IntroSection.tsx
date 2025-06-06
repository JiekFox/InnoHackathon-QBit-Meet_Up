import React from 'react';
import { useNavigate } from 'react-router';
import { CREATE_MEETUPS } from '../../constant/router';

interface IntroSectionProps {
    styleClass: string;
    title: string;
    description: string;
    isButton?: boolean;
}
const IntroSection: React.FC<IntroSectionProps> = ({
    styleClass,
    title,
    description,
    isButton = false
}) => {
    const navigate = useNavigate();

    return (
        <section className={styleClass}>
            <h2 className="title">{title}</h2>
            <p className="description"> {description}</p>
            {isButton && (
                <button
                    className="create-meeting-button"
                    onClick={() => navigate(CREATE_MEETUPS)}
                >
                    Create
                </button>
            )}
        </section>
    );
};

export default IntroSection;
