import React, { useState, useCallback } from 'react';
import DebounceInput from './DebounceInput';
import { useTranslation } from 'react-i18next';
import FilterPanel, { FilterData } from './FilterPanel';
import { Tag } from './TagSelector';

interface FilterBarProps {
    onSearchChange: (query: string) => void;
    onFiltersApply?: (filters: FilterData) => void;
    onClearFilters?: () => void;
    onRecommendByAI?: () => void | Promise<void>;
    onQueryTuchUseAI?: () => void | Promise<void>;
    allTags?: Tag[];
    tagsLoading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = React.memo(
    ({
        onSearchChange,
        onFiltersApply,
        onClearFilters,
        onRecommendByAI,
        onQueryTuchUseAI,
        allTags = [],
        tagsLoading = false
    }) => {
        const { t } = useTranslation();
        const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
        const [isAiSearchLoading, setIsAiSearchLoading] = useState(false);
        const [isAiRecommendLoading, setIsAiRecommendLoading] = useState(false);
        const [resetTrigger, setResetTrigger] = useState(0);

        const handleSearchChange = useCallback(
            (query: string) => {
                onSearchChange(query);
            },
            [onSearchChange]
        );

        const handleFiltersApply = useCallback(
            (filters: FilterData) => {
                if (onFiltersApply) {
                    onFiltersApply(filters);
                }
            },
            [onFiltersApply]
        );

        const handleClearFilters = useCallback(() => {
            setResetTrigger(prev => prev + 1);
            if (onClearFilters) {
                onClearFilters();
            }
        }, [onClearFilters]);

        const handleAiSearchClick = async () => {
            if (!onQueryTuchUseAI) return;

            setIsAiSearchLoading(true);
            try {
                await onQueryTuchUseAI();
            } finally {
                setIsAiSearchLoading(false);
            }
        };

        const handleAiRecommendClick = async () => {
            if (!onRecommendByAI) return;

            setIsAiRecommendLoading(true);
            try {
                await onRecommendByAI();
            } finally {
                setIsAiRecommendLoading(false);
            }
        };

        return (
            <>
                <div className="filter-bar">
                    <button
                        className="filter-button"
                        onClick={() => setIsFilterPanelOpen(true)}
                        type="button"
                    >
                        {t('filterBar.filterButton')}
                    </button>

                    <DebounceInput
                        type="text"
                        id="search"
                        name="search"
                        placeholder={t('filterBar.searchPlaceholder')}
                        className="search-input"
                        onChange={handleSearchChange}
                        delay={500}
                    />
                    {onClearFilters && (
                        <button
                            className="filter-button filter-clear-button "
                            onClick={handleClearFilters}
                            type="button"
                        >
                            {t('filterBar.clearFilters')} ❌
                        </button>
                    )}
                    {onQueryTuchUseAI && (
                        <button
                            className={`ai-button ai-button-meetups-section ${isAiSearchLoading ? 'ai-loading' : ''}`}
                            onClick={handleAiSearchClick}
                            disabled={isAiSearchLoading}
                        >
                            {isAiSearchLoading
                                ? t('common.loading')
                                : `${t('filterBar.aiSearch')}✨`}
                        </button>
                    )}

                    {onRecommendByAI && (
                        <button
                            className={`ai-button ai-button-meetups-section ${isAiRecommendLoading ? 'ai-loading' : ''}`}
                            onClick={handleAiRecommendClick}
                            disabled={isAiRecommendLoading}
                        >
                            {isAiRecommendLoading
                                ? t('common.loading')
                                : `${t('filterBar.aiRecommend')} ✨`}
                        </button>
                    )}
                </div>

                <FilterPanel
                    isOpen={isFilterPanelOpen}
                    onClose={() => setIsFilterPanelOpen(false)}
                    onApplyFilters={handleFiltersApply}
                    allTags={allTags}
                    tagsLoading={tagsLoading}
                    resetTrigger={resetTrigger}
                />
            </>
        );
    }
);

export default FilterBar;
