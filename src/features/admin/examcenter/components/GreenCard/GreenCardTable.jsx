// @ts-nocheck

// @ts-ignore
import React from 'react';
import {
  Loader2,
  FileText,
  PencilLine,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import FilterGreenCard from './FilterGreenCard';

// @ts-ignore
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(
    amount,
  );

const GreenCardTable = ({
  // @ts-ignore
  tableData,
  // @ts-ignore
  selectedIds,
  // @ts-ignore
  toggleSelectAll,
  // @ts-ignore
  toggleSelect,
  // @ts-ignore
  handleEditClick,
  // @ts-ignore
  handleDeleteSelected,
  // @ts-ignore
  handleReset,
  // @ts-ignore
  isDeleting,
  // @ts-ignore
  SERVER,
  // @ts-ignore
  loading,
  // @ts-ignore
  search,
  range,
  handleRangeChange,
  // @ts-ignore
  limit,
  setLimit,
  // @ts-ignore
  handleExport,
  handleSearchChange,
}) => {
  const isAllSelected = tableData?.length
    ? selectedIds?.length === tableData?.length && tableData?.length > 0
    : false;

  return (
    <>
      {/* FILTER SECTION */}
      <FilterGreenCard
        tableData={tableData}
        search={search}
        range={range}
        handleRangeChange={handleRangeChange}
        // @ts-ignore
        limit={limit}
        setLimit={setLimit}
        handleSearchChange={handleSearchChange}
        handleExport={handleExport}
        handleReset={handleReset}
        selectedIds={selectedIds}
        handleDeleteSelected={() => handleDeleteSelected(selectedIds)}
        isDeleting={isDeleting}
      />

      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50/50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-[#0070bb] cursor-pointer"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    disabled={loading || !tableData?.length}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Institute
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Seller
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fee
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-20 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2
                        size={32}
                        className="animate-spin text-[#0070bb]"
                      />
                      <span className="ml-3 text-sm text-slate-500">
                        Please wait...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : !tableData?.length ? (
                <tr>
                  <td colSpan="8" className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={32} className="text-slate-300" />
                      <p className="mt-3 text-sm text-slate-500">
                        No admit cards match your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tableData?.map((card, idx) => (
                  <tr
                    key={card?._id}
                    className={`group transition-colors hover:bg-blue-50/40 ${
                      selectedIds.includes(card._id) ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-[#0070bb] cursor-pointer"
                        checked={selectedIds?.includes(card._id)}
                        onChange={() => toggleSelect(card._id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-100 to-slate-200 font-semibold text-slate-700 shadow-inner">
                          {card?.studentPhoto ? (
                            <img
                              src={`${SERVER}${card?.studentPhoto}`}
                              alt={card?.studentName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            card?.studentName?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold flex flex-wrap items-center gap-1 text-slate-800">
                            <span className="font-sans">
                              {card.studentName}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono">{card.studentId}</span>
                          </p>
                          <p className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                            <span className="font-mono">
                              {card.academicYear}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{card.studentPhone}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-slate-800">
                        {card.polytechnicName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {card.department} • {card.examType}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[xs]">
                      <p className="capitalize text-slate-800">
                        {card.seller?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {card.seller?.phone || 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-bold text-slate-800">
                        {formatCurrency(card.amount)}
                      </span>
                      {card.discountAmount > 0 && (
                        <span className="ml-1 text-[10px] text-green-600">
                          -{formatCurrency(card.discountAmount)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          card.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : card.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {card.status === 'Paid' && <CheckCircle size={10} />}
                        {card.status === 'Pending' && <Clock size={10} />}
                        {card.status !== 'Paid' &&
                          card.status !== 'Pending' && (
                            <AlertCircle size={10} />
                          )}
                        {card.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(card)}
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#0070bb]"
                          title="Edit"
                        >
                          <PencilLine size={16} />
                        </button>
                        {/* <button
                                                    onClick={() => handleDeleteSelected(card._id)}
                                                    disabled={isDeleting}
                                                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default GreenCardTable;
