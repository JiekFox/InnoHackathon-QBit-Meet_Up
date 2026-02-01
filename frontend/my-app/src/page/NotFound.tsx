import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound(): JSX.Element {
    const navigate = useNavigate();

    return (
        <main className="not-found-page ep-x1a2b3_page">
            <div className="not-found-inner ep-x1a2b3_inner">
                <h1 className="ep-x1a2b3_heading">404</h1>
                <h2 className="ep-x1a2b3_sub">Страница не найдена</h2>
                <p className="ep-x1a2b3_msg">
                    Возможно, ресурс был удалён или ссылка неверна.
                </p>
                <div className="not-found-actions ep-x1a2b3_actions">
                    <Link to="/" className="button ep-x1a2b3_button">
                        На главную
                    </Link>
                    <button
                        className="button ep-x1a2b3_button"
                        onClick={() => navigate(-1)}
                    >
                        Назад
                    </button>
                </div>
            </div>
        </main>
    );
}
