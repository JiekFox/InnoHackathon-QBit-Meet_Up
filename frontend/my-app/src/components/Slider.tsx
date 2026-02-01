import React, { useState, useEffect } from 'react';
import { Meetup, ParamsForFetch } from '../constant/types';
import icon from '../assets/img/icon.png';
import Loader from './Loader';
import { formatDate } from '../utils/formatDate';
import { Link, NavLink } from 'react-router-dom';
import { MEETUP_DETAILS } from '../constant/router';

const SLIDER_SIZE = 5;

type Fetcher<T> = (
    params: ParamsForFetch
) => Promise<{ results: T[]; count: number }>;

interface HeroProps {
    fetchMeetups: Fetcher<Meetup>;
}

const HeroMeetupSlider: React.FC<HeroProps> = ({ fetchMeetups }) => {
    const [meetups, setMeetups] = useState<Meetup[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [loadedPages, setLoadedPages] = useState(0);

    const loadHeroData = async (page: number = 1) => {
        try {
            const data = await fetchMeetups({
                page,
                pageSize: SLIDER_SIZE
            });
            if (page === 1) {
                setMeetups(data.results);
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

    const handleNext = () => {
        setCurrentIndex(prev => (prev === maxIndex ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? maxIndex : prev - 1));
    };

    const current = meetups[currentIndex];
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
            <button onClick={handlePrev} className="slider-nav-btn prev">
                ❮
            </button>
            <button onClick={handleNext} className="slider-nav-btn next">
                ❯
            </button>

            <div className="hero-slider-main">
                <div className="hero-slide-flex">
                    <div className="hero-text-side">
                        <div className="hero-info-wrapper">
                            <span className="hero-badge">Анонс</span>
                            <h1 className="hero-title">{current.title}</h1>
                            <p className="hero-description">{current.description}</p>
                            <div className="hero-meta">
                                <span>
                                    {formatDate(current.dateTime ?? '', {
                                        dateOnly: true
                                    })}
                                </span>
                            </div>
                            <Link
                                className="create-meeting-button "
                                to={`${MEETUP_DETAILS}/${current.id}`}
                            >
                                Details
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
    );
};

export default HeroMeetupSlider;
