const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  filteredItems,
  onPageChange,
  onPageSizeChange,
  colorScheme = 'primary',
  showFiltered = false,
}) => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(currentPage * pageSize, filteredItems || totalItems);
  const displayTotal = filteredItems !== undefined ? filteredItems : totalItems;
  const actualTotalPages = totalPages || Math.ceil(displayTotal / pageSize);

  // Color schemes
  const colorClasses = {
    primary: {
      text: 'text-primary-600',
      bg: 'bg-primary-600',
      ring: 'focus:ring-primary-500 focus:border-primary-500',
    },
    green: {
      text: 'text-green-600',
      bg: 'bg-green-600',
      ring: 'focus:ring-green-500 focus:border-green-500',
    },
  };

  const colors = colorClasses[colorScheme] || colorClasses.primary;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Top row: Info and Page Size Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Info */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị{' '}
            <span className={`font-semibold ${colors.text} dark:text-primary-400`}>
              {displayTotal > 0 ? startIndex + 1 : 0}
            </span>
            {' '}-{' '}
            <span className={`font-semibold ${colors.text} dark:text-primary-400`}>
              {endIndex}
            </span>
            {' '}trong tổng số{' '}
            <span className={`font-semibold ${colors.text} dark:text-primary-400`}>{displayTotal}</span> văn bản
            {showFiltered && filteredItems !== undefined && filteredItems !== totalItems && (
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                (đã lọc từ {totalItems} văn bản)
              </span>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Hiển thị:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={`px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 ${colors.ring}`}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
        </div>

        {/* Page navigation - Only show if multiple pages */}
        {actualTotalPages > 1 && (
          <div className="flex items-center justify-center gap-1">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              ← Trước
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {(() => {
                const pages = [];
                const current = currentPage;

                // Luôn hiển thị trang đầu
                pages.push(1);

                // Thêm ... nếu cần
                if (current > 3) {
                  pages.push('...');
                }

                // Hiển thị các trang xung quanh trang hiện tại
                for (let i = Math.max(2, current - 1); i <= Math.min(actualTotalPages - 1, current + 1); i++) {
                  if (!pages.includes(i)) {
                    pages.push(i);
                  }
                }

                // Thêm ... nếu cần
                if (current < actualTotalPages - 2) {
                  pages.push('...');
                }

                // Luôn hiển thị trang cuối
                if (actualTotalPages > 1 && !pages.includes(actualTotalPages)) {
                  pages.push(actualTotalPages);
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === current
                          ? `${colors.bg} dark:bg-primary-700 text-white`
                          : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === actualTotalPages}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
