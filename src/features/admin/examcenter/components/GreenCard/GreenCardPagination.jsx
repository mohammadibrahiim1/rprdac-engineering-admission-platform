// @ts-ignore
import React from 'react';

// @ts-ignore
const GreenCardPagination = ({ pagination, page, setPage }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 bg-gray-100 rounded"
      >
        Prev
      </button>

      <span>
        Page {page} of {pagination?.totalPages || 1}
      </span>

      <button
        onClick={() => setPage(page + 1)}
        disabled={page >= pagination?.totalPages}
        className="px-3 py-1 bg-gray-100 rounded"
      >
        Next
      </button>
    </div>
  );
};

export default GreenCardPagination;
