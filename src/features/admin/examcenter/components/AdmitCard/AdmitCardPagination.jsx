import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const AdmitCardPagination = ({ meta, handlePageChange }) => {
  const {
    currentPage = 1,
    totalPages = 1,
    totalData = 0,
    limit = 10,
  } = meta || {};

  if (totalPages <= 1) return null;

  const startEntry = (currentPage - 1) * limit + 1;
  const endEntry = Math.min(startEntry + limit - 1, totalData);

  const renderButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i, totalPages)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
              currentPage === i
                ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {i}
          </button>,
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        buttons.push(
          <div
            key={i}
            className="flex items-end justify-center w-6 text-slate-400 pb-2"
          >
            <MoreHorizontal size={14} />
          </div>,
        );
      }
    }
    return buttons;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-6 mt-8 border-t border-slate-200/60 pb-12">
      <p className="text-xs font-medium text-slate-500">
        Showing{' '}
        <span className="text-slate-900 font-semibold">
          {startEntry}-{endEntry}
        </span>{' '}
        of <span className="text-slate-900 font-semibold">{totalData}</span>{' '}
        entries
      </p>

      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1, totalPages)}
          className="w-9 h-9 flex items-center justify-center transition-all bg-white border rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5">{renderButtons()}</div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1, totalPages)}
          className="w-9 h-9 flex items-center justify-center transition-all bg-white border rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdmitCardPagination;
