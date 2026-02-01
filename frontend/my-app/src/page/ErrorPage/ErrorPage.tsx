import React, { useCallback } from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotFound from '../NotFound';
import './ErrorPage.css';

function safeStringFromRouteError(err: unknown): string {
    if (!err) return 'Unknown error';
    const anyErr = err as any;
    if (typeof anyErr === 'string') return anyErr;
    if (typeof anyErr === 'object') {
        if (anyErr?.detail) return String(anyErr.detail);
        if (anyErr?.message) return String(anyErr.message);
        try {
            return JSON.stringify(anyErr);
        } catch (e) {
            return 'Unknown error object';
        }
    }
    return String(anyErr);
}

function ErrorPageComponent() {
    const { t } = useTranslation();
    const routeError = useRouteError();

    const handleError = useCallback(() => {
        console.error(routeError);
    }, [routeError]);

    handleError();

    const status = (routeError as any)?.status;
    const statusText = (routeError as any)?.statusText;
    const rawMessage = safeStringFromRouteError(
        (routeError as any)?.message || (routeError as any)
    );
    const message =
        rawMessage === 'Unknown error'
            ? t('errorPage.unknownError', 'Unknown error')
            : rawMessage;

    const loadingText = t('common.loading', 'Loading...');
    const goHome = t('buttons.goHome', 'Go to Home');
    const unexpected = t('errorPage.unexpected', 'Unexpected error');

    return (
        <React.Suspense fallback={<div>{loadingText}</div>}>
            <main>
                <div className="errorContainer ep-x1a2b3_error">
                    {status === 404 ? (
                        <NotFound />
                    ) : (
                        <div className="ep-x1a2b3_generic">
                            <h1 className="ep-x1a2b3_status">
                                {status ?? t('errorPage.unknownStatus', 'Unknown')} -{' '}
                                {statusText ?? unexpected}
                            </h1>
                            <p className="ep-x1a2b3_message">{message}</p>
                            <Link to="/" className="ep-x1a2b3_button">
                                {goHome}
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </React.Suspense>
    );
}

export const ErrorPage = React.memo(ErrorPageComponent);
