import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound(): JSX.Element {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <main className="not-found-page ep-x1a2b3_page">
            <div className="not-found-inner ep-x1a2b3_inner">
                <h1 className="ep-x1a2b3_heading">{t('notFound.title')}</h1>
                <h2 className="ep-x1a2b3_sub">{t('notFound.heading')}</h2>
                <p className="ep-x1a2b3_msg">{t('notFound.message')}</p>
                <div className="not-found-actions ep-x1a2b3_actions">
                    <Link to="/" className="button ep-x1a2b3_button">
                        {t('notFound.goHome')}
                    </Link>
                    <button
                        className="button ep-x1a2b3_button"
                        onClick={() => navigate(-1)}
                    >
                        {t('notFound.goBack')}
                    </button>
                </div>
            </div>
        </main>
    );
}
