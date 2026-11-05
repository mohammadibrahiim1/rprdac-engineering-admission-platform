// @ts-ignore
import React from 'react';
// @ts-ignore
import { Search, Download, Trash2, Loader2 } from 'lucide-react';
// @ts-ignore
import { useGreenCardExplorer } from '../../hooks/useGreenCardExplorer';

// @ts-ignore
const FilterGreenCard = ({
  tableData,
  // @ts-ignore
  academicYear,
  // @ts-ignore
  summary,
  // @ts-ignore
  pagination,
  // @ts-ignore
  isLoading,
  // @ts-ignore
  handleSearchChange,
  search,
  // @ts-ignore
  handleSetSession,
  // @ts-ignore
  range,
  handleRangeChange,
  // @ts-ignore
  limit,
  setLimit,
  // @ts-ignore
  selectedIds,
  // @ts-ignore
  toggleSelect,
  // @ts-ignore
  toggleSelectAll,
  // @ts-ignore
  handleReset,
  // @ts-ignore
  handleDeleteSelected,
  // @ts-ignore
  isDeleting,
  // @ts-ignore
  handleExport,
  // @ts-ignore
  handleEdit,
  // @ts-ignore
  SERVER,
  // @ts-ignore
  page,
  // @ts-ignore
  setPage,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white mt-6">
      {/* SEARCH */}
      <div className="flex flex-1 flex-wrap gap-2">
        <input
          name="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search / ID / phone"
          className="h-10 flex-1 rounded border px-3"
        />
        <button
          onClick={handleExport}
          disabled={!tableData}
          className="flex items-center gap-2 bg-green-100 px-4 rounded cursor-pointer"
        >
          <Download size={14} />
          Export
        </button>
        {/* ID Range Filters */}
        <input
          name="startId"
          value={range?.startId}
          onChange={handleRangeChange}
          placeholder="Start ID"
          className="h-10 w-24 rounded border px-2"
        />
        <input
          name="endId"
          value={range?.endId}
          onChange={handleRangeChange}
          placeholder="End ID"
          className="h-10 w-24 rounded border px-2"
        />

        {/* Limit Selector */}
        <select
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="h-10 border rounded px-2"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="all">All</option>
        </select>
        <button
          onClick={handleReset}
          className="h-10 px-4 bg-slate-100 hover:bg-red-200 rounded text-red-600 font-medium transition"
        >
          Clear Filter
        </button>
      </div>

      {/* DELETE */}
      {selectedIds?.length > 0 && (
        <button
          onClick={() => handleDeleteSelected(selectedIds)}
          disabled={isDeleting}
          className="flex items-center gap-2 bg-red-100 px-4 rounded h-10 px-4 bg-slate-100 hover:bg-red-200 rounded text-red-600 font-medium transition"
        >
          {isDeleting ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Trash2 size={14} />
          )}
          Delete ({selectedIds?.length})
        </button>
      )}
    </div>
  );
};

export default FilterGreenCard;
