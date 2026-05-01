import React from 'react';
import { useNavigate } from 'react-router';
import { CREATE_MEETUPS } from '../constant/router';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    return (
        <section className={styleClass}>
            <h2 className="title">{title}</h2>
            <p className="description"> {description}</p>
            {isButton && (
                <button
                    className="create-meeting-button create-meeting-button-min-width"
                    onClick={() => navigate(CREATE_MEETUPS)}
                >
                    {t('introSection.createButton')}
                </button>
            )}
        </section>
    );
};

export default IntroSection;
