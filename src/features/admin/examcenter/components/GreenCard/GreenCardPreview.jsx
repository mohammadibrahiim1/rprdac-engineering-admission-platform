// @ts-nocheck

// src/features/examcenter/components/GreenCard/GreenCardPreview.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Square,
  Printer,
  Trash2,
  Loader2,
  Download,
} from 'lucide-react';
import GreenAdmitCard from './GreenAdmitCard';
import Loading from '../../../../../../components/Loader';

const chunkArray = (array, size) => {
  if (!array || !Array.isArray(array)) return [];
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

const GreenCardPreview = ({
  view,
  tableData,
  range,
  handleRangeChange,
  handleSearchChange,
  isDeleting,
  handleExport,
  limit,
  setLimit,
  page,
  setPage,
  handleReset,
  search,
  loadingCards,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  handlePrintGreenCard,
  handleDelete,
  printRef,
}) => {
  if (view !== 'preview') return null;

  // Limit "all"
  const parsedLimit =
    limit === 'all' ? tableData?.length : parseInt(limit, 10) || 10;
  const limitedTableData = tableData ? tableData.slice(0, parsedLimit) : [];

  const cardsToPrint =
    selectedIds?.length > 0
      ? limitedTableData.filter((card) => selectedIds.includes(card._id))
      : limitedTableData;

  const printPages = chunkArray(cardsToPrint, 8);

  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* --- Print Styles --- */}
      <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    
                    #print-area {
                        position: absolute !important;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }

                    .print-page {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        grid-template-rows: repeat(4, 1fr) !important;
                        gap: 15px !important;
                        padding: 5mm !important;
                        
                        height: 296mm !important; 
                        width: 100% !important;
                        box-sizing: border-box !important;
                        
                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    .print-page:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }

                    .admit-card-wrapper {
                        width: 100% !important;
                        height: 100% !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        overflow: hidden !important;
                    }

                    @page {
                        size: legal portrait;
                        margin: 0; 
                    }
                }
            `}</style>

      {/* --- Pixel Perfect & Responsive Header --- */}
      <div className="bg-white p-2 print:hidden">
        {/* Header Top: Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Print Preview</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500">
                Selected for printing:
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                {selectedIds?.length || 0} / {limitedTableData?.length || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 rounded border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
            >
              {selectedIds?.length === limitedTableData?.length &&
              limitedTableData?.length > 0 ? (
                <CheckSquare size={18} className="text-emerald-600" />
              ) : (
                <Square size={18} className="text-slate-400" />
              )}
              {selectedIds?.length === 0 ? 'Select All' : 'Deselect All'}
            </button>

            <button
              onClick={handlePrintGreenCard}
              disabled={selectedIds?.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded font-bold text-sm shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={18} />
              Print {selectedIds?.length > 0 ? `(${selectedIds?.length})` : ''}
            </button>
          </div>
        </div>

        {/* Header Bottom: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="w-[400px]">
            <input
              name="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by Name, ID or Phone..."
              className="w-full h-10 rounded border border-slate-300 px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* ID Range */}
          <div className="flex items-center gap-2">
            <input
              name="startId"
              value={range?.startId || ''}
              onChange={handleRangeChange}
              placeholder="Start ID"
              className="w-24 h-10 rounded border border-slate-300 px-3 text-sm text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <span className="text-slate-400 font-medium">-</span>
            <input
              name="endId"
              value={range?.endId || ''}
              onChange={handleRangeChange}
              placeholder="End ID"
              className="w-24 h-10 rounded border border-slate-300 px-3 text-sm text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Limit Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 ml-2">
              Show:
            </span>
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="h-10 rounded border border-slate-300 px-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="all">All</option>
            </select>
          </div>

          {/* Clear Filter Button */}
          <button
            onClick={handleReset}
            className="h-10 px-5 bg-red-50 hover:bg-red-100 rounded text-red-600 text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* --- Selection Grid / Loading --- */}
      {loadingCards ? (
        <div className="py-12">
          <Loading />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Visible selection cards (UI only, hidden on print) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:hidden">
            {limitedTableData?.map((student) => (
              <motion.div
                key={student?._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleSelect(student._id)}
                className="relative cursor-pointer group"
              >
                <div className="absolute z-10 top-3 right-3 bg-white/80 backdrop-blur-sm rounded p-1 shadow-sm opacity-100 transition-opacity">
                  {selectedIds?.includes(student._id) ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  )}
                </div>
                {/* Admit Card Component */}
                <div
                  className={`rounded transition-all ${selectedIds?.includes(student._id) ? '' : 'hover:shadow-md'}`}
                >
                  <GreenAdmitCard data={student} />
                </div>
              </motion.div>
            ))}

            {limitedTableData?.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                No cards found matching your criteria.
              </div>
            )}
          </div>

          {/* Hidden print area (Visible ONLY on print) */}
          <div id="print-area" ref={printRef} className="hidden">
            {printPages?.map((pageCards, pageIndex) => (
              <div key={`print-page-${pageIndex}`} className="print-page">
                {pageCards?.map((student) => (
                  <div
                    key={`print-card-${student?._id}`}
                    className="admit-card-wrapper"
                  >
                    <GreenAdmitCard data={student} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GreenCardPreview;
