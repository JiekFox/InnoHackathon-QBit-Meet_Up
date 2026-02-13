import React, { useState } from 'react';

export interface Tag {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface TagSelectorProps {
    tags: Tag[];
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    maxTags?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({
    tags,
    selectedTags,
    onTagsChange,
    maxTags
}) => {
    const handleTagToggle = (tag: Tag) => {
        const isSelected = selectedTags.some(t => t.id === tag.id);

        if (isSelected) {
            onTagsChange(selectedTags.filter(t => t.id !== tag.id));
        } else {
            // Check if max tags limit is reached
            if (maxTags && selectedTags.length >= maxTags) {
                return;
            }
            onTagsChange([...selectedTags, tag]);
        }
    };

    const handleRemoveTag = (tagId: number) => {
        onTagsChange(selectedTags.filter(t => t.id !== tagId));
    };

    return (
        <div className="tag-selector-container">
            {/* Selected tags */}
            <div className="selected-tags-section">
                <div className="selected-tags">
                    {selectedTags.map(tag => (
                        <div
                            key={tag.id}
                            className="selected-tag"
                            style={{ backgroundColor: tag.color }}
                            onClick={() => handleRemoveTag(tag.id)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Remove ${tag.name} tag`}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleRemoveTag(tag.id);
                                }
                            }}
                        >
                            <span>{tag.name}</span>
                            <button type="button" className="remove-tag-btn">
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="available-tags-section">
                <div className="available-tags">
                    {tags
                        .filter(tag => !selectedTags.some(t => t.id === tag.id))
                        .map(tag => {
                            const isMaxReached = !!(
                                maxTags && selectedTags.length >= maxTags
                            );
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className="tag-badge"
                                    style={{
                                        backgroundColor: tag.color
                                    }}
                                    onClick={() => handleTagToggle(tag)}
                                    disabled={isMaxReached}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default TagSelector;
