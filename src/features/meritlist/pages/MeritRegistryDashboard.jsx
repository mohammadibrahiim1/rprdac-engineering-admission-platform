import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Search,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Database,
  Calendar,
  AlertCircle,
  SlidersHorizontal,
  Filter,
} from 'lucide-react';
import {
  useDeleteMeritRecordsMutation,
  useGetMeritRecordsQuery,
} from '../services/meritApi';

const generateSessions = () => {
  const startBaseYear = 2023;
  const currentYear = new Date().getFullYear();
  const targetEndYear = currentYear + 2;
  const sessionsList = [{ value: '', label: 'Select a Session' }];
  for (let year = startBaseYear; year <= targetEndYear; year++) {
    const nextYear = year + 1;
    sessionsList.push({
      value: `${year}-${String(nextYear).slice(-2)}`,
      label: `Session ${year}-${nextYear}`,
    });
  }
  return sessionsList;
};

const SESSIONS = generateSessions();

const MeritRegistryDashboard = () => {
  //---------------------------------------------------------
  // 1. Server-Side Operational States
  //---------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSession, setSelectedSession] = useState('');

  // Debounced states to coordinate single-flight server hits
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedModel, setDebouncedModel] = useState('');
  const [debouncedDate, setDebouncedDate] = useState('');
  const [debouncedSession, setDebouncedSession] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Supports numbers or "all"
  const [rowSelection, setRowSelection] = useState({});

  // Consolidated debounce effect hook for user layout parameters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedModel(selectedModel);
      setDebouncedDate(selectedDate);
      setDebouncedSession(selectedSession);
      setCurrentPage(1); // Reset page layout pointer upon criteria modification
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedModel, selectedSession, selectedDate]);

  //---------------------------------------------------------
  // 2. API Connectors (Queries & Mutations)
  //---------------------------------------------------------
  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetMeritRecordsQuery({
    search: debouncedSearch,
    page: currentPage,
    limit: pageSize,
    session: debouncedSession,
    model: debouncedModel,
    examDate: debouncedDate,
  });

  const [deleteMeritRecords, { isLoading: isDeleting }] =
    useDeleteMeritRecordsMutation();

  const apiData = response?.data || [];
  const pagination = response?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const isAllMode = pageSize === 'all';

  //---------------------------------------------------------
  // 3. Command Context Handlers
  //---------------------------------------------------------
  const handleDeleteRecords = useCallback(
    async (targetIds) => {
      if (!targetIds || targetIds.length === 0) return;

      const confirmMessage = `Are you sure you want to permanently delete ${targetIds.length} selected record(s)?`;
      if (!window.confirm(confirmMessage)) return;

      try {
        const res = await deleteMeritRecords(targetIds).unwrap();
        setRowSelection({});
        alert(
          res.message || `Successfully deleted ${targetIds.length} record(s).`,
        );
      } catch (err) {
        alert(err?.data?.message || 'Operation failed.');
      }
    },
    [deleteMeritRecords],
  );

  const handleBulkDelete = () => {
    const selectedRows = table.getSelectedRowModel().flatRows;
    const selectedIds = selectedRows.map((row) => row.original._id);
    handleDeleteRecords(selectedIds);
  };

  //---------------------------------------------------------
  // 4. TanStack Column Struct Mapping (With Serial Columns)
  //---------------------------------------------------------
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center px-1">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              aria-label="Select all rows"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-1">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              aria-label="Select row"
            />
          </div>
        ),
        size: 50,
      },
      {
        id: 'serialNumber',
        header: 'Sl No',
        cell: ({ row }) => {
          // Dynamically computes sequential numbers across active page skips
          const currentLimit = isAllMode
            ? pagination.totalItems
            : Number(pageSize);
          const computedIndex = isAllMode
            ? row.index + 1
            : (currentPage - 1) * currentLimit + row.index + 1;
          return (
            <span className="font-semibold text-slate-400 font-mono">
              {computedIndex}
            </span>
          );
        },
      },
      {
        accessorKey: 'studentId',
        header: 'Roll / ID',
        cell: (info) => (
          <span className="font-mono font-bold text-slate-900">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'studentName',
        header: 'Student Name',
        cell: (info) => (
          <span className="font-semibold text-slate-800">
            {info.getValue()}
          </span>
        ),
      },

      {
        accessorKey: 'examInfo.examDate',
        header: 'Date',
        cell: (info) => {
          const rawDate = info.getValue();
          if (!rawDate) return 'N/A';

          const dateObj = new Date(rawDate);

          if (isNaN(dateObj.getTime())) return 'N/A';

          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // January হলো 0, তাই +1
          const year = dateObj.getFullYear();

          return `${day}-${month}-${year}`;
        },
      },

      {
        accessorKey: 'examInfo.departmentId',
        header: 'Dept',
        cell: (info) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
            {info.getValue() || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'examInfo.session',
        header: 'Session',
        cell: (info) => (
          <span className="text-slate-500 font-semibold">
            {info.getValue() || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'examInfo.model',
        header: 'Model',
        cell: (info) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
            {info.getValue() || 'N/A'}
          </span>
        ),
      },
      {
        id: 'obtainedMarks',
        header: 'Obtained Marks',
        cell: ({ row }) => {
          const marks = row.original?.data?.obtained__marks ?? 'N/A';
          const total = row.original?.examInfo?.totalMarks ?? '300';
          return (
            <div className="flex flex-col">
              <span className="font-bold text-indigo-600 text-sm">{marks}</span>
              <span className="text-[10px] text-slate-400 font-medium">
                Out of {total}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleDeleteRecords([row.original._id])}
              className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [
      handleDeleteRecords,
      currentPage,
      pageSize,
      isAllMode,
      pagination.totalItems,
    ],
  );

  //---------------------------------------------------------
  // 5. React Table Core Initialization
  //---------------------------------------------------------
  const table = useReactTable({
    data: apiData,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row._id,
    manualPagination: true,
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 font-sans overflow-x-hidden">
      {/* Cover Graphic Strip */}
      <div className="relative w-full h-44 bg-gradient-to-r from-slate-100 via-slate-200/70 to-zinc-100 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-2xl"></div>
      </div>

      {/* Content View Layout */}
      <div className="mx-auto px-5 sm:px-6 lg:px-5 -mt-12 relative z-10 pb-16 space-y-6">
        {/* Notion Structural Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded bg-white border border-slate-200/80 shadow-md p-5 text-4xl select-none">
          🎓
        </div>

        {/* Dashboard Metadata Headers */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-900 sm:text-3xl">
            Students Merit Registry
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Direct Database Stream
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Academic Session 2023-24 onwards
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            This repository stores system-wide parsed merit datasets.
            Administrators can filter specific models, search criteria
            parameters, and execute safe bulk actions.
          </p>
        </div>

        {/* Core Registry Panel */}
        <div className="bg-white border border-slate-200/70 rounded shadow-sm max-w-full overflow-hidden">
          {/* Integrated Toolbars & Filters */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/40 space-y-3">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              {/* Multi-Parameter Filters Context */}
              <div className="flex flex-wrap items-center gap-2 flex-1 max-w-4xl">
                {/* Full-Text Query Search */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID or roll..."
                    className="bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded pl-10 pr-4 py-2 text-xs w-full outline-none transition-all font-semibold placeholder:text-slate-400/80"
                  />
                  <div className="absolute left-3.5 top-3.5 flex items-center justify-center">
                    {isFetching ? (
                      <Loader2 className="animate-spin text-indigo-500 w-4 h-4" />
                    ) : (
                      <Search className="text-slate-400 w-4 h-4" />
                    )}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <select
                    value={selectedSession}
                    onChange={(e) => {
                      setSelectedSession(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                  >
                    {SESSIONS?.map((session) => (
                      <option key={session.value} value={session.value}>
                        {session.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relational Model Match Selector */}
                <div className="relative w-full sm:w-40">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-white border border-slate-200 focus:border-indigo-500 rounded px-3 py-2 text-xs w-full outline-none font-semibold text-slate-600 appearance-none cursor-pointer"
                  >
                    <option value="">All Exam Models</option>
                    <option value="Model-1">Model-1</option>
                    <option value="Model-2">Model-2</option>
                    <option value="Model-3">Model-3</option>
                  </select>
                  <Filter className="absolute right-3 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>

                {/* Relational Exam Date Match Selector */}
                <div className="relative w-full sm:w-44">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white border border-slate-200 focus:border-indigo-500 rounded px-3 py-1.5 text-xs w-full outline-none font-semibold text-slate-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Batch Operation Trigger Controls */}
              <div className="flex items-center gap-2 justify-end shrink-0">
                {selectedCount > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 transition-colors text-xs font-semibold px-4 py-2 rounded shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Delete Selected ({selectedCount})</span>
                  </button>
                )}
                <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider pl-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Merit Registry
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Desktop Structural Data Layout */}
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[950px] divide-y divide-slate-100 table-layout-fixed">
              <thead className="bg-slate-50/60 border-b border-slate-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3.5 font-bold text-left text-[11px] text-slate-400 uppercase tracking-wider select-none"
                        style={{
                          width:
                            header.getSize() !== 150
                              ? header.getSize()
                              : undefined,
                        }}
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
              <tbody className="bg-white divide-y divide-slate-100">
                {isLoading || isFetching ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-20 text-xs text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="font-semibold text-slate-500">
                          Please wait...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : apiData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-24 text-xs text-slate-400 font-medium"
                    >
                      <div className="max-w-xs mx-auto space-y-2 whitespace-normal">
                        <div className="w-10 h-10 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-700">
                          No active records found
                        </p>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          No database entries matched your selected parameters.
                          Clear your search or date query filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/40 transition-colors duration-100 ${row.getIsSelected() ? 'bg-indigo-50/20' : ''}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-3.5 text-xs font-semibold text-slate-600 whitespace-nowrap"
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

          {/* Operational Pagination Controls Bar */}
          {apiData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 p-4 border-t border-t-slate-100 text-xs font-medium text-slate-600">
              {/* Left Controls Block */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={
                      isAllMode || !pagination.hasPrevPage || isFetching
                    }
                    className="inline-flex items-center justify-center p-2 border border-slate-200 rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={
                      isAllMode || !pagination.hasNextPage || isFetching
                    }
                    className="inline-flex items-center justify-center p-2 border border-slate-200 rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-slate-400 text-xs">
                  {isAllMode ? (
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60">
                      All Data Stream Active
                    </span>
                  ) : (
                    <>
                      Page{' '}
                      <strong className="text-slate-800 font-bold">
                        {pagination.currentPage}
                      </strong>{' '}
                      of{' '}
                      <strong className="text-slate-800 font-bold">
                        {pagination.totalPages}
                      </strong>
                    </>
                  )}
                </span>
              </div>

              {/* Right Dynamic Page Sizing Block */}
              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60">
                <span className="text-slate-400 text-xs">
                  Total Items:{' '}
                  <strong className="text-slate-700 font-extrabold">
                    {pagination.totalItems}
                  </strong>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] font-bold">
                    Rows:
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      setPageSize(nextVal === 'all' ? 'all' : Number(nextVal));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 font-semibold shadow-sm cursor-pointer outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >
                    {[10, 25, 50, 100, 'all'].map((size) => (
                      <option key={size} value={size}>
                        {size === 'all' ? 'Show All Rows' : `${size} rows`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeritRegistryDashboard;
