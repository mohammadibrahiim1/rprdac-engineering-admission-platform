import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Loader2,
  FileText,
  Calendar,
  Clock,
  Phone,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  useDeleteNursingDutyMutation,
  useGetNursingAllDutiesQuery,
  useUpdateNursingDutyMutation,
} from '../../../../../redux/features/Nursing/NursingApi';
import { formatTimeAMPM } from '../../../../../constants/timeFormat';

// ----------------------------------------------------------------------
// States Components (Loading & Empty)
// ----------------------------------------------------------------------
const LoadingState = () => (
  <div className="flex items-center justify-center py-24 bg-white rounded border border-[#E2E8F0]">
    <div className="text-center">
      <Loader2 className="h-10 w-10 animate-spin text-[#0052FF] mx-auto mb-3" />
      <p className="text-sm text-gray-500 font-medium">
        Loading production data...
      </p>
    </div>
  </div>
);

const EmptyState = ({ type }) => (
  <div className="flex items-center justify-center py-24 bg-white rounded border border-[#E2E8F0]">
    <div className="text-center">
      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-500 font-medium font-sans">
        No {type} found.
      </p>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const NursingDutyManagement = () => {
  // Single Unified Filters State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5, // Default Match your backend API format
    search: '',
    status: 'pending',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    month: '',
    year: '',
  });

  // Tanstack Table States
  const [rowSelection, setRowSelection] = useState({});

  // Dynamic Column Visibility State (User clicks to hide/show columns)

  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    phone: true,
    date: true,
    messName: true,
    startTime: true,
    endTime: true,
    totalAmount: true,
    status: true,
    actions: true,
  });

  // RTK Query API Call passing unified backend query params object
  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
  } = useGetNursingAllDutiesQuery(filters);

  const [updateNursingDuty, { isLoading: isUpdating }] =
    useUpdateNursingDutyMutation();
  const [deleteNursingDuty, { isLoading: isDeleting }] =
    useDeleteNursingDutyMutation();

  // Backend Response data mapping
  const dutiesList = apiResponse?.data || [];
  const pagination = apiResponse?.pagination || {
    totalDocuments: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  };

  // Handler Actions
  const handleApprove = useCallback(
    async (id) => {
      try {
        await updateNursingDuty({ id, status: 'approve' }).unwrap();
        alert('Duty approved successfully.');
        refetch();
      } catch (err) {
        alert(err?.data?.message || 'Approval failed.');
      }
    },
    [refetch, updateNursingDuty],
  );

  const handleDeleteSingle = useCallback(
    async (id) => {
      if (!window.confirm('Are you sure you want to delete this duty?')) return;
      try {
        await deleteNursingDuty([id]).unwrap();
        alert('Deleted successfully.');
        refetch();
      } catch (err) {
        alert(err?.data?.message || 'Delete failed.');
      }
    },
    [deleteNursingDuty, refetch],
  );

  const handleDeleteSelected = async () => {
    const selectedIndices = Object.keys(rowSelection);
    const selectedIds = selectedIndices
      .map((index) => dutiesList[Number(index)]?._id)
      .filter(Boolean);

    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected duties?`,
      )
    )
      return;

    try {
      await deleteNursingDuty(selectedIds).unwrap();
      alert(`${selectedIds.length} duties deleted successfully.`);
      setRowSelection({});
    } catch (err) {
      alert(err?.data?.message || 'Bulk delete failed.');
    }
  };

  // Column Definitions representing standard enterprise mapping
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="w-4 h-4 text-[#0052FF] border-gray-300 rounded focus:ring-[#0052FF] cursor-pointer"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="w-4 h-4 text-[#0052FF] border-gray-300 rounded focus:ring-[#0052FF] cursor-pointer"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorFn: (row) =>
          row.employeeName || row.userName || 'Unknown Employee',
        id: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-bold text-[#0F172A] text-sm capitalize">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        id: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <Phone size={13} className="text-gray-400" />
            {getValue() || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'date',
        id: 'date',
        header: 'Date',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <Calendar size={13} className="text-gray-400" />
            {getValue() ? new Date(getValue()).toLocaleDateString() : 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'messName',
        id: 'messName',
        header: 'Mess Name',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            {getValue() || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'dutyStartTime',
        id: 'startTime',
        header: 'Start Time',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <Clock size={13} className="text-emerald-500" />
            {formatTimeAMPM(getValue()) || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'dutyEndTime',
        id: 'endTime',
        header: 'End Time',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <Clock size={13} className="text-rose-500" />
            {formatTimeAMPM(getValue()) || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'totalAmount',
        id: 'totalAmount',
        header: 'Total Amount',
        cell: ({ getValue }) => (
          <span className="font-bold text-[#0F172A] text-sm">
            ৳ {getValue() || 0}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = (getValue() || 'active').toLowerCase();
          let styles = 'bg-emerald-100 text-emerald-700';
          if (status === 'review' || status === 'pending')
            styles = 'bg-amber-100 text-amber-700';
          if (status === 'approve' || status === 'approved')
            styles = 'bg-blue-100 text-blue-700';

          return (
            <span
              className={`px-2.5 rounded text-[12px] font-bold uppercase ${styles}`}
            >
              {status === 'approve' || status === 'approved'
                ? 'approved'
                : status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const status = (row.original.status || '').toLowerCase();
          const showApproveButton = status === 'pending' || status === 'review';
          return (
            <div className="flex items-center gap-2">
              {showApproveButton && (
                <button
                  onClick={() => handleApprove(row.original._id)}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors disabled:opacity-40"
                >
                  <CheckCircle size={13} /> Approve
                </button>
              )}
              <button
                onClick={() => handleDeleteSingle(row.original._id)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors disabled:opacity-40"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          );
        },
      },
    ],
    [isUpdating, isDeleting, handleApprove, handleDeleteSingle],
  );

  // Tanstack Instance Setup
  const table = useReactTable({
    data: dutiesList,
    columns,
    state: { rowSelection, columnVisibility },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState type="errors / backend query mismatch" />;

  return (
    <div className="w-full flex items-center justify-center font-sans">
      <div className="w-full bg-white rounded border border-[#E2E8F0] shadow-sm p-5 md:p-6 flex flex-col gap-4">
        {/* Visual Window Mock Dots */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-black uppercase">
            Nursing duty management
          </span>
        </div>

        {/* Search input and Tab Filtering */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-2">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search nurses by name..."
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1, // Filtering triggers page reset
                }));
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded focus:outline-none focus:border-[#0052FF] transition-colors"
            />
          </div>

          {/* Status Pill Headers */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded self-start md:self-auto">
            {['All', 'pending', 'Review', 'approve'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    status: tab === 'All' ? '' : tab,
                    page: 1,
                  }));
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${
                  (tab === 'All' && !filters.status) || filters.status === tab
                    ? 'bg-[#0052FF] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab === 'approve' ? 'Approved' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Column Visibility Toggles */}
        <div className="text-xs border-t pt-3 border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {table
              ?.getAllLeafColumns()
              ?.filter((col) => col.id !== 'select' && col.id !== 'actions')
              .map((column) => (
                <button
                  key={column.id}
                  onClick={column.getToggleVisibilityHandler()}
                  className={`px-3 py-1.5 rounded border font-bold transition-all ${
                    column.getIsVisible()
                      ? 'bg-[#EFF6FF] text-[#0052FF] border-[#BFDBFE]'
                      : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                  }`}
                >
                  {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                </button>
              ))}
          </div>

          {/* Bulk Actions & Selection context */}
          <div className="flex items-center gap-3 ml-auto pt-2">
            {Object.keys(rowSelection).length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-rose-100 text-rose-700 border border-rose-300 rounded font-bold hover:bg-rose-200 transition-colors flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete Selected (
                {Object.keys(rowSelection).length})
              </button>
            )}
            <span className="text-[#64748B] font-bold">
              Total Records: {pagination.totalDocuments}
            </span>
          </div>
        </div>

        {/* Table Layout */}
        <div className="overflow-x-auto border border-[#EAECF0] rounded">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-[#EAECF0] bg-[#F8FAFC]"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-3 px-4 text-left text-xs font-bold text-[#64748B] tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {dutiesList.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns?.length}
                    className="text-center py-12 text-gray-400 text-sm font-medium"
                  >
                    No active custom nursing data matching queries.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[#EAECF0] transition-colors hover:bg-[#F8FAFC] ${
                      row.getIsSelected() ? 'bg-[#F0F5FF]' : 'bg-white'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="py-3.5 px-4 text-sm align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Control & Limit dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          {/* Page Limit Selector Inside Table Footer */}
          <div className="flex items-center gap-2">
            <select
              value={filters.limit}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }));
              }}
              className="text-xs font-bold text-blue-700 bg-blue-50/50 border border-blue-100 rounded px-3 py-1.5 focus:outline-none cursor-pointer hover:bg-blue-50 transition-colors"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  Shows {size}
                </option>
              ))}
            </select>
          </div>

          {/* Server Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(prev.page - 1, 1),
                }))
              }
              disabled={filters.page === 1}
              className="px-4 py-1.5 text-xs font-bold text-[#64748B] border border-[#E2E8F0] rounded bg-white shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>

            <span className="text-xs font-bold text-[#475569]">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </span>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(prev.page + 1, pagination.totalPages),
                }))
              }
              disabled={filters.page === pagination.totalPages}
              className="px-4 py-1.5 text-xs font-bold text-white border border-[#0052FF] rounded bg-[#0052FF] shadow-sm hover:bg-[#0041CC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursingDutyManagement;
