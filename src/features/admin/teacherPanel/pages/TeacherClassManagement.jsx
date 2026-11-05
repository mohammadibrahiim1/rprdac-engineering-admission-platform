import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  CheckCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Trash2,
  FileText,
  Eye,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import toast from 'react-hot-toast';
import {
  useDeleteTeacherClassMutation,
  useGetTeacherClassListQuery,
  useUpdateClassMutation,
} from '../../../../../redux/features/teacher/teacherApi';

// ----------------------------------------------------------------------
// Reusable UI States & Loaders
// ----------------------------------------------------------------------
const LoadingState = () => (
  <div className="flex items-center justify-center py-24 bg-white rounded border border-slate-100">
    <div className="text-center">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-sm text-gray-500 font-medium">Fetching sync data...</p>
    </div>
  </div>
);

const EmptyState = ({ type, onReset }) => (
  <div className="flex items-center justify-center py-24 bg-white rounded border border-slate-100">
    <div className="text-center">
      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-500 font-medium mb-3">
        No matching {type} discovered.
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition"
        >
          Clear Filter Search
        </button>
      )}
    </div>
  </div>
);

// ----------------------------------------------------------------------
// Main Application Component
// ----------------------------------------------------------------------
const TeacherClassManagement = () => {
  // 1. Core API & Query Filters State Setup
  const defaultFilters = useMemo(
    () => ({
      page: 1,
      limit: 5,
      search: '',
      status: 'pending',
      paymentStatus: '',
      month: '',
      year: '',
    }),
    [],
  );

  const [filters, setFilters] = useState(defaultFilters);
  const [searchInput, setSearchInput] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({
    select: true,
    teacher: true,
    batch: true,
    subjectDepartment: true,
    schedule: true,
    amount: true,
    date: true,
    status: true,
    actions: true,
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Check if filters deviate from their default values (to show the "Clear Filters" button)
  const isFiltered = useMemo(() => {
    return (
      searchInput !== '' ||
      filters.status !== 'pending' ||
      filters.limit !== 5 ||
      filters.page !== 1
    );
  }, [filters, searchInput]);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setFilters(defaultFilters);
    setRowSelection({});
    toast.success('Filters cleared successfully!');
  }, [defaultFilters]);

  // 2. Search Debounce Implementation
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  // 3. RTK Query Hooks for Live Database Integration
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetTeacherClassListQuery(filters);
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [deleteTeacherClass, { isLoading: isDeletingClass }] =
    useDeleteTeacherClassMutation();

  // Backend Meta Extractor Map
  const tableData = useMemo(() => apiResponse?.data || [], [apiResponse]);
  const totalCount = apiResponse?.totalCount || 0;
  const totalPages = apiResponse?.totalPages || 1;
  const currentPage = apiResponse?.currentPage || 1;

  // 4. Action Request Handlers
  const handleApprove = useCallback(
    async (courseId) => {
      try {
        await updateClass({ courseId: courseId, status: 'approve' }).unwrap();
        toast.success('Class verified and approved successfully!');
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || 'Verification action failed.');
      }
    },
    [updateClass, refetch],
  );

  const handleDelete = useCallback(
    async (courseId) => {
      if (!courseId) return;

      if (
        window.confirm(
          'Are you sure you want to completely drop this session entry?',
        )
      ) {
        try {
          await deleteTeacherClass({ ids: [courseId] }).unwrap();
          toast.success('Class record deleted perfectly.');
          setRowSelection({});
          refetch();
        } catch (error) {
          toast.error(
            error?.data?.message || 'Failed to process cancellation.',
          );
        }
      }
    },
    [deleteTeacherClass, refetch],
  );

  // Bulk Delete Action Handler
  const handleBulkDelete = useCallback(async () => {
    const selectedIndices = Object.keys(rowSelection);

    // TanStack Table-এর ইনডেক্স থেকে একচুয়াল আইডিগুলো ফিল্টার করে নেওয়া
    const selectedIds = selectedIndices
      .map((index) => tableData[index]?._id)
      .filter(Boolean);

    if (selectedIds.length === 0) {
      toast.error('No records selected for deletion.');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete the ${selectedIds.length} selected class records?`,
      )
    ) {
      try {
        await deleteTeacherClass({ ids: selectedIds }).unwrap();

        toast.success(
          `Successfully deleted ${selectedIds.length} class records.`,
        );
        setRowSelection({});
        refetch();
      } catch (error) {
        toast.error(
          error?.data?.message ||
            'Failed to delete selected records. Please try again.',
        );
      }
    }
  }, [rowSelection, tableData, deleteTeacherClass, refetch]);

  // 5. TanStack Table Columns Configurations Structure
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
        ),
      },
      {
        id: 'teacher',
        header: 'Teacher',
        accessorFn: (row) => row.teacher?.userName || 'Anonymous Profile',
        cell: ({ getValue, row }) => (
          <div className="py-1">
            <p className="font-semibold text-gray-900 capitalize text-sm">
              {getValue()}
            </p>
            <p className="text-xs text-gray-400 font-mono">
              {row.original.teacher?.phone || 'No Linked Phone'}
            </p>
          </div>
        ),
      },
      {
        id: 'batch',
        header: 'Batch',
        accessorKey: 'batch',
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
            {getValue() || 'N/A'}
          </span>
        ),
      },
      {
        id: 'subjectDepartment',
        header: 'Subject & Dept.',
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-medium text-gray-800">
              {row.original.subject || 'Not Set'}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {row.original.department || 'General'}
            </div>
          </div>
        ),
      },
      {
        id: 'schedule',
        header: 'Schedule',
        accessorKey: 'classQuantity',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <Clock size={14} className="text-gray-400" />
            {getValue() || 0} Hours
          </div>
        ),
      },
      {
        id: 'amount',
        header: 'Amount',
        accessorKey: 'totalFee',
        cell: ({ getValue }) => (
          <span className="text-sm font-bold text-gray-900 font-mono">
            ৳{(getValue() || 0).toLocaleString('en-BD')}
          </span>
        ),
      },
      {
        id: 'date',
        header: 'Date',
        accessorFn: (row) => row.classDate,
        cell: ({ getValue }) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            {getValue()
              ? new Date(getValue()).toLocaleDateString('en-GB')
              : 'N/A'}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue()?.toLowerCase() || 'pending';
          const config =
            {
              approve: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
              pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
              review: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
            }[status] || 'bg-gray-50 text-gray-700 border-gray-200';

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config} capitalize`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const isRowPending = row.original.status === 'pending';
          return (
            <div className="flex items-center gap-2">
              {isRowPending && (
                <button
                  onClick={() => handleApprove(row.original._id)}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition shadow-sm disabled:opacity-50"
                >
                  <CheckCircle size={13} /> Approve
                </button>
              )}
              <button
                onClick={() => handleDelete(row.original._id)}
                disabled={isDeletingClass}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-red-50 text-red-600 border border-gray-200 rounded transition disabled:opacity-50"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          );
        },
      },
    ],
    [isUpdating, isDeletingClass, handleApprove, handleDelete],
  );

  // 6. Hook Initialization for TanStack Engines Layout Configuration
  const table = useReactTable({
    data: tableData,
    columns,
    state: { columnVisibility, rowSelection },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  const selectedRowsCount = Object.keys(rowSelection).length;
  const startRow = (currentPage - 1) * filters.limit + 1;
  const endRow = Math.min(currentPage * filters.limit, totalCount);

  if (isLoading) return <LoadingState />;

  return (
    <div className="w-full bg-[#f8fafc] font-sans">
      <div className="mx-auto bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* ---------------------------------------------------------------------- */}
        {/* TOOLBAR SYSTEM HEADER (Filters + Search)                               */}
        {/* ---------------------------------------------------------------------- */}
        <div className="p-5 flex flex-col gap-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-black uppercase">
              Teacher duty management
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Component Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, teachers or credentials..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>

            {/* Right aligned action block */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Segment Status Filters */}
              <div className="flex items-center bg-slate-100/85 p-1 rounded border border-slate-200/40 select-none">
                {[
                  { label: 'All Records', value: '' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Approved', value: 'approve' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() =>
                      setFilters((p) => ({ ...p, status: tab.value, page: 1 }))
                    }
                    className={`px-4 py-1.5 text-xs font-semibold rounded transition-all ${
                      filters.status === tab.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Column Visibility Render Manager Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white rounded text-slate-700 hover:bg-slate-50 transition"
                >
                  <Eye size={14} className="text-slate-400" /> Columns
                  Visibility
                </button>
                {isColumnDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsColumnDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded shadow-xl z-20 p-2.5 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-150">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-100">
                        Toggle Fields
                      </p>
                      {table
                        .getAllLeafColumns()
                        .filter((col) => col.getCanHide())
                        .map((column) => (
                          <label
                            key={column.id}
                            className="flex items-center gap-2.5 px-2 py-1.5 text-xs text-slate-600 font-medium cursor-pointer hover:bg-slate-50 rounded-md transition"
                          >
                            <input
                              type="checkbox"
                              checked={column.getIsVisible()}
                              onChange={column.getToggleVisibilityHandler()}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="capitalize">
                              {column.id.replace(/([A-Z])/g, ' $1')}
                            </span>
                          </label>
                        ))}
                    </div>
                  </>
                )}
              </div>

              {/* Clear Filter Small Trigger Action Button */}
              {isFiltered && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 rounded transition"
                >
                  <X size={13} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* ACTIVE BULK ACTIONS CONTEXT HEADER                                     */}
        {/* ---------------------------------------------------------------------- */}
        <AnimatePresence>
          {selectedRowsCount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-50/50 border-b border-blue-100 overflow-hidden"
            >
              <div className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <p className="text-xs text-blue-800 font-semibold">
                    Selected{' '}
                    <strong className="text-blue-900">
                      {selectedRowsCount}
                    </strong>{' '}
                    row(s) for bulk processing
                  </p>
                </div>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm transition"
                >
                  <Trash2 size={13} /> Delete Selected ({selectedRowsCount})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------------- */}
        {/* GRID INTERACTION RENDER TABLE DATA ENGINE LAYER                        */}
        {/* ---------------------------------------------------------------------- */}
        <div className="overflow-x-auto w-full relative">
          {isFetching && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-200">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          )}

          {tableData.length === 0 ? (
            <EmptyState
              type="class records"
              onReset={isFiltered ? handleClearFilters : null}
            />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-slate-50/70 border-b border-slate-200/80"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="py-3.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider select-none bg-slate-50/50"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      layoutId={`row-${row.original._id}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`hover:bg-slate-50/60 transition-colors group ${
                        row.getIsSelected()
                          ? 'bg-blue-50/20 hover:bg-blue-50/30'
                          : 'bg-white'
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="py-3 px-4 text-sm text-slate-700 align-middle"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* BOTTOM COMPACT PAGINATION & AUDIT LIMIT ACTIONS CONTROLS               */}
        {/* ---------------------------------------------------------------------- */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          {/* Left pagination details block */}
          <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500 font-medium">
            <span>
              Showing{' '}
              <strong className="text-slate-800 font-semibold">
                {totalCount === 0 ? 0 : startRow}
              </strong>
              –
              <strong className="text-slate-800 font-semibold">{endRow}</strong>{' '}
              of{' '}
              <strong className="text-slate-800 font-semibold">
                {totalCount}
              </strong>{' '}
              rows
            </span>

            {/* Show Rows selector placed clean and small at the bottom left */}
            <div className="flex items-center gap-1.5 border border-slate-200/80 rounded bg-white px-2 py-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Limit
              </span>
              {/* Select Field in Pagination Footer */}
              <select
                value={filters.limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    limit: newLimit,
                    page: 1, // Limit change korle direct Page 1 e back asbe
                  }));
                }}
                className="text-xs font-bold text-slate-700 focus:outline-none bg-transparent cursor-pointer"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Server Pagination Trigger Buttons Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
              disabled={currentPage === 1 || isFetching}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white text-slate-700 rounded hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition flex items-center gap-1 shadow-sm disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            <div className="hidden md:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    Math.abs(currentPage - p) <= 2 ||
                    p === 1 ||
                    p === totalPages,
                )
                .map((pageNumber, idx, arr) => {
                  const showEllipsis = idx > 0 && pageNumber - arr[idx - 1] > 1;

                  return (
                    <React.Fragment key={pageNumber}>
                      {showEllipsis && (
                        <span className="text-slate-400 px-1 text-xs">...</span>
                      )}
                      <button
                        onClick={() =>
                          setFilters((p) => ({ ...p, page: pageNumber }))
                        }
                        disabled={isFetching}
                        className={`w-8 h-8 rounded text-xs font-bold transition ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <div className="flex md:hidden items-center text-xs font-bold text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              disabled={
                currentPage === totalPages || isFetching || totalCount === 0
              }
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 bg-white text-slate-700 rounded hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition flex items-center gap-1 shadow-sm disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherClassManagement;
