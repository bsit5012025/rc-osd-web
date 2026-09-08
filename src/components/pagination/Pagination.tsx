interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
}

function Pagination({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
}: PaginationProps) {
    return (
        <div className="dashboard-pagination">
            <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={onPrevious}
            >
                <i className="bi bi-chevron-left"></i>
                <span>Previous</span>
            </button>

            <span className="pagination-info">
                Page {currentPage} of {totalPages}
            </span>

            <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={onNext}
            >
                <span>Next</span>
                <i className="bi bi-chevron-right"></i>
            </button>
        </div>
    );
}

export default Pagination;