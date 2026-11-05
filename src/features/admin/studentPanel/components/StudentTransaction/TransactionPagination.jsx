const TransactionPagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  isFetching,
}) => {
  if (totalItems === 0) return null;

  const isAll = String(limit).toLowerCase() === 'all';
  const numericLimit = isAll ? totalItems : Number(limit) || 10;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * numericLimit + 1;
  const endItem = isAll
    ? totalItems
    : Math.min(currentPage * numericLimit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-start gap-8 rounded px-4 py-3">
      {/* Results count & Limit Dropdown */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
        <div>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>

        {/* Limit Selector */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            disabled={isFetching}
            className="border border-gray-300 rounded px-2.5 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Pagination Navigation (Only show if not 'all' and totalPages > 1) */}
      {!isAll && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isFetching}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700 px-2">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isFetching}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionPagination;
