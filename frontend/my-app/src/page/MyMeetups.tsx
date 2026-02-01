import { MY_MEETUPS_OWNER, MY_MEETUPS_SUBSCRIBER } from '../constant/router';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function MyMeetups() {
    const { t } = useTranslation();

    return (
        <>
            <h2>{t('myMeetups.title')}</h2>
            <div>{t('myMeetups.description')}</div>

            <NavLink to={MY_MEETUPS_SUBSCRIBER}>
                <h1 className="title">{t('myMeetups.subscriber')}</h1>
            </NavLink>

            <NavLink to={MY_MEETUPS_OWNER}>
                <h1 className="title">{t('myMeetups.owner')}</h1>
            </NavLink>
        </>
    );
}
