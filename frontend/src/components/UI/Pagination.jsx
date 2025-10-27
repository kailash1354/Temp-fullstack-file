import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showEdges = true,
}) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage, endPage;

      if (currentPage <= 3) {
        startPage = 2;
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      <div className="flex items-center space-x-3">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`inline-flex items-center px-5 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center space-x-2">
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={page === "..."}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                page === currentPage
                  ? "bg-luxury-gold text-white shadow-lg scale-110"
                  : page === "..."
                  ? "text-gray-400 cursor-default"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={page === "..." ? "More pages" : `Page ${page}`}
            >
              {page === "..." ? <MoreHorizontal className="w-5 h-5" /> : page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center px-5 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
          }`}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      {/* Page Info */}
      <div className="hidden sm:flex items-center text-sm text-gray-700 dark:text-gray-300">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        {totalPages > 1 && (
          <span className="ml-3 text-gray-500">({totalPages} total pages)</span>
        )}
      </div>

      {/* Mobile Pagination */}
      <div className="sm:hidden flex items-center space-x-3">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {currentPage} / {totalPages}
        </span>
      </div>
    </nav>
  );
};

export default Pagination;
