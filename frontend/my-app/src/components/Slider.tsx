import React, { useState, useEffect } from 'react';
import { Meetup, ParamsForFetch } from '../constant/types';
import icon from '../assets/img/icon.png';
import Loader from './Loader';
import { formatDate } from '../utils/formatDate';
import { Link, NavLink } from 'react-router-dom';
import { MEETUP_DETAILS } from '../constant/router';
import { useTranslation } from 'react-i18next';

const SLIDER_SIZE = 5;

type Fetcher<T> = (
    params: ParamsForFetch
) => Promise<{ results: T[]; count: number }>;

interface HeroProps {
    fetchMeetups: Fetcher<Meetup>;
}

const HeroMeetupSlider: React.FC<HeroProps> = ({ fetchMeetups }) => {
    const { t } = useTranslation();
    const [meetups, setMeetups] = useState<Meetup[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [loadedPages, setLoadedPages] = useState(0);
    const [userInteracted, setUserInteracted] = useState(false);
    const [prevIndex, setPrevIndex] = useState<number | null>(null);
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
    const animTimeout = React.useRef<number | null>(null);

    const loadHeroData = async (page: number = 1) => {
        try {
            const data = await fetchMeetups({
                page,
                pageSize: SLIDER_SIZE
            });
            if (page === 1) {
                setMeetups(data.results);
                console.log('Fetched meetups:', data.results);
                setLoadedPages(1);
            } else {
                setMeetups(prev => {
                    const startIndex = (page - 1) * SLIDER_SIZE;
                    const merged = [...prev];
                    data.results.forEach((item, idx) => {
                        const pos = startIndex + idx;
                        merged[pos] = item;
                    });
                    return merged;
                });
                setLoadedPages(page);
            }
            setTotalCount(data.count);
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error ? err : new Error('An unknown error occurred')
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHeroData(1);
    }, []);

    useEffect(() => {
        if (meetups.length < totalCount) {
            const needsPrefetch = currentIndex >= Math.max(0, meetups.length - 2);
            if (needsPrefetch && !loading) {
                const nextPage = loadedPages + 1;
                setLoading(true);
                loadHeroData(nextPage).finally(() => setLoading(false));
            }
        }

        if (
            currentIndex >= meetups.length &&
            totalCount > meetups.length &&
            !loading
        ) {
            const neededPage = Math.floor(currentIndex / SLIDER_SIZE) + 1;
            if (neededPage > loadedPages) {
                setLoading(true);
                loadHeroData(neededPage).finally(() => setLoading(false));
            }
        }
    }, [currentIndex, meetups.length, totalCount, loadedPages, loading]);

    const maxIndex =
        totalCount > 0 ? totalCount - 1 : Math.max(0, meetups.length - 1);

    const performSlide = (
        newIndex: number,
        dir: 'next' | 'prev',
        isUser = false
    ) => {
        if (animTimeout.current) {
            window.clearTimeout(animTimeout.current);
            animTimeout.current = null;
        }
        setPrevIndex(currentIndex);
        setDirection(dir);
        setCurrentIndex(newIndex);
        if (isUser) setUserInteracted(true);
        setAnimating(true);
        // end animation after 550ms
        animTimeout.current = window.setTimeout(() => {
            setPrevIndex(null);
            setAnimating(false);
            setDirection(null);
            animTimeout.current = null;
        }, 550);
    };

    const handleNext = (isUser = false) => {
        const nextIndex = currentIndex === maxIndex ? 0 : currentIndex + 1;
        performSlide(nextIndex, 'next', isUser);
    };

    const handlePrev = (isUser = false) => {
        const prevIdx = currentIndex === 0 ? 0 : currentIndex - 1;
        // if already at first and user clicked, no action
        if (isUser && currentIndex === 0) return;
        performSlide(prevIdx, 'prev', isUser);
    };

    const handleNextUser = () => handleNext(true);
    const handlePrevUser = () => handlePrev(true);

    const autoAdvance = React.useCallback(() => {
        setCurrentIndex(prev => {
            const nextIdx = prev === maxIndex ? 0 : prev + 1;
            setPrevIndex(prev);
            setDirection('next');
            setAnimating(true);
            if (animTimeout.current) clearTimeout(animTimeout.current);
            animTimeout.current = window.setTimeout(() => {
                setPrevIndex(null);
                setAnimating(false);
                setDirection(null);
                animTimeout.current = null;
            }, 550);
            return nextIdx;
        });
    }, [maxIndex]);

    useEffect(() => {
        if (userInteracted) return;
        if (totalCount <= 1 && meetups.length <= 1) return;
        const id = setInterval(() => {
            autoAdvance();
        }, 5000);
        return () => clearInterval(id);
    }, [userInteracted, totalCount, meetups.length, autoAdvance]);

    useEffect(() => {
        return () => {
            if (animTimeout.current) window.clearTimeout(animTimeout.current);
        };
    }, []);

    const current = meetups[currentIndex];
    const prev = prevIndex !== null ? meetups[prevIndex] : null;
    if (error) {
        return (
            <div className="hero-viewport">
                {' '}
                <h1 className="error-message"> {error.message}</h1>
            </div>
        );
    }

    if (!current) {
        return (
            <div className="hero-viewport">
                <Loader />{' '}
            </div>
        );
    }

    return (
        <div className="hero-viewport">
            <button
                onClick={handlePrevUser}
                className={`slider-nav-btn prev ${currentIndex === 0 ? 'disabled' : ''}`}
                disabled={currentIndex === 0}
                aria-disabled={currentIndex === 0}
            >
                ❮
            </button>
            <button onClick={handleNextUser} className="slider-nav-btn next">
                ❯
            </button>

            <div className="hero-slider-main">
                <div className="slide-wrapper">
                    {prev && (
                        <div
                            className={`slide slide-prev ${animating ? (direction === 'next' ? 'animate-out-left' : 'animate-out-right') : ''}`}
                            key={`prev-${prevIndex}`}
                        >
                            <div className="hero-slide-flex">
                                <div className="hero-text-side">
                                    <div className="hero-info-wrapper">
                                        <div className="hero-tags">
                                            {prev.tags && prev.tags.length > 0 ? (
                                                prev.tags.map(tag => (
                                                    <span
                                                        key={tag.id}
                                                        className="tag-badge"
                                                        style={{
                                                            backgroundColor:
                                                                tag.color
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="hero-badge">
                                                    {/* {t('slider.announcement')} */}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="hero-title">{prev.title}</h1>
                                        <p className="hero-description">
                                            {prev.description}
                                        </p>
                                        <div className="hero-meta">
                                            <span>
                                                {formatDate(prev.dateTime ?? '', {
                                                    dateOnly: false
                                                })}
                                            </span>
                                            {prev.duration !== undefined && (
                                                <span className="hero-duration">
                                                    ⏱ {prev.duration}{' '}
                                                    {t('common.hours')}
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            className="create-meeting-button "
                                            to={`${MEETUP_DETAILS}/${prev.id}`}
                                        >
                                            {t('slider.details')}
                                        </Link>
                                    </div>
                                </div>

                                <Link
                                    className="hero-image-side"
                                    to={`${MEETUP_DETAILS}/${prev.id}`}
                                >
                                    <img
                                        src={prev.image ? prev.image : icon}
                                        alt={prev.title}
                                        className="hero-main-img"
                                    />
                                </Link>
                            </div>
                        </div>
                    )}

                    <div
                        className={`slide slide-current ${animating ? (direction === 'next' ? 'animate-in-from-right' : 'animate-in-from-left') : ''}`}
                        key={`cur-${currentIndex}`}
                    >
                        <div className="hero-slide-flex">
                            <div className="hero-text-side">
                                <div className="hero-info-wrapper">
                                    <div className="hero-tags">
                                        {current.tags && current.tags.length > 0 ? (
                                            current.tags.map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className=" tag-badge"
                                                    style={{
                                                        backgroundColor: tag.color
                                                    }}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="hero-badge">
                                                {/* {t('slider.announcement')} */}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="hero-title">{current.title}</h1>
                                    <p className="hero-description">
                                        {current.description}
                                    </p>
                                    <div className="hero-meta">
                                        <span>
                                            {formatDate(current.dateTime ?? '', {
                                                dateOnly: false
                                            })}
                                        </span>
                                        {current.duration !== undefined && (
                                            <span className="hero-duration">
                                                ⏱ {current.duration}{' '}
                                                {t('common.hours')}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        className="create-meeting-button "
                                        to={`${MEETUP_DETAILS}/${current.id}`}
                                    >
                                        {t('slider.details')}
                                    </Link>
                                </div>
                            </div>

                            <Link
                                className="hero-image-side"
                                to={`${MEETUP_DETAILS}/${current.id}`}
                            >
                                <img
                                    src={current.image ? current.image : icon}
                                    alt={current.title}
                                    className="hero-main-img"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroMeetupSlider;
