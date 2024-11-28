import React, { useCallback } from 'react';

const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
    const handlePageClick = useCallback(
        page => {
            if (page >= 1 && page <= totalPages) {
                onPageChange(page);
            }
        },
        [totalPages, onPageChange]
    );

    const renderPages = useCallback(() => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            if (currentPage > 2) pages.push(currentPage - 1);
            pages.push(currentPage);
            if (currentPage < totalPages - 1) pages.push(currentPage + 1);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    }, [currentPage, totalPages]);

    return (
        <nav className="pagination">
            <button
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
            >
                « Previous
            </button>
            {renderPages().map((page, index) =>
                page === '...' ? (
                    <span key={index} className="pagination-ellipsis">
                        {page}
                    </span>
                ) : (
                    <button
                        key={index}
                        className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageClick(page)}
                    >
                        {page}
                    </button>
                )
            )}
            <button
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next »
            </button>
        </nav>
    );
});

export default Pagination;
