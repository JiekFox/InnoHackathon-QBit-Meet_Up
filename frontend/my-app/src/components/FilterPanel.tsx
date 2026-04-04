import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TagSelector, { Tag } from './TagSelector';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterData) => void;
    allTags: Tag[];
    tagsLoading: boolean;
    resetTrigger?: number;
}

export interface FilterData {
    startDate: string;
    endDate: string;
    selectedTags: Tag[];
    showOldMeetups: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    isOpen,
    onClose,
    onApplyFilters,
    allTags,
    tagsLoading,
    resetTrigger
}) => {
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [showOldMeetups, setShowOldMeetups] = useState<boolean>(false);

    useEffect(() => {
        if (resetTrigger === undefined) return;

        setStartDate('');
        setEndDate('');
        setSelectedTags([]);
        setShowOldMeetups(false);
    }, [resetTrigger]);

    const handleApply = useCallback(() => {
        onApplyFilters({
            startDate,
            endDate,
            selectedTags,
            showOldMeetups
        });
        onClose();
    }, [startDate, endDate, selectedTags, showOldMeetups, onApplyFilters, onClose]);

    const handleReset = useCallback(() => {
        setStartDate('');
        setEndDate('');
        setSelectedTags([]);
        setShowOldMeetups(false);
        onApplyFilters({
            startDate: '',
            endDate: '',
            selectedTags: [],
            showOldMeetups: false
        });
        onClose();
    }, [onApplyFilters, onClose]);

    const hasActiveFilters = useMemo(() => {
        return startDate || endDate || selectedTags.length > 0 || showOldMeetups;
    }, [startDate, endDate, selectedTags, showOldMeetups]);

    return (
        <>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="filter-panel-backdrop"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Filter Panel */}
                    <div
                        className="filter-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="filter-panel-title"
                    >
                        <div className="filter-panel-header">
                            <h2 id="filter-panel-title">
                                {t('filterPanel.title') || 'Filters'}
                            </h2>
                            <button
                                className="filter-panel-close"
                                onClick={onClose}
                                aria-label="Close filters"
                                type="button"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="filter-panel-content">
                            {/* Date Filters */}
                            <div className="filter-section">
                                <h3>{t('filterPanel.dateRange') || 'Date Range'}</h3>
                                <div className="date-inputs">
                                    <div className="date-input-wrapper">
                                        <label htmlFor="start-date">
                                            {t('filterPanel.startDate') ||
                                                'Start Date'}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="start-date"
                                            value={startDate}
                                            onChange={e =>
                                                setStartDate(e.target.value)
                                            }
                                            className="date-input"
                                        />
                                    </div>
                                    <div className="date-input-wrapper">
                                        <label htmlFor="end-date">
                                            {t('filterPanel.endDate') || 'End Date'}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="end-date"
                                            value={endDate}
                                            onChange={e =>
                                                setEndDate(e.target.value)
                                            }
                                            className="date-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="filter-section">
                                <label className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={showOldMeetups}
                                        onChange={e =>
                                            setShowOldMeetups(e.target.checked)
                                        }
                                    />
                                    {t('filterPanel.showOldMeetups') ||
                                        'Показывать и старые митапы'}
                                </label>
                            </div>

                            <div className="filter-section">
                                <h3>{t('filterPanel.tags') || 'Tags'}</h3>
                                {tagsLoading ? (
                                    <div className="loading-tags">
                                        <p>{t('common.loading')}</p>
                                    </div>
                                ) : (
                                    <TagSelector
                                        tags={allTags}
                                        selectedTags={selectedTags}
                                        onTagsChange={setSelectedTags}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="filter-panel-footer">
                            <button
                                className={`filter-panel-button reset ${!hasActiveFilters ? 'disabled' : ''}`}
                                onClick={handleReset}
                                disabled={!hasActiveFilters}
                                type="button"
                            >
                                {t('filterPanel.reset') || 'Reset'}
                            </button>
                            <button
                                className="filter-panel-button apply"
                                onClick={handleApply}
                                type="button"
                            >
                                {t('filterPanel.apply') || 'Apply'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default FilterPanel;
