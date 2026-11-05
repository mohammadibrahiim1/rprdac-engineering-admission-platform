import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useGetCombinedMeritListQuery } from '../services/meritApi';
import Loader from '../../../../components/Loader';

import {
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Trophy,
  GraduationCap,
  Calendar,
  Database,
} from 'lucide-react';

const DEPARTMENTS = [
  { value: '', label: 'Select a Department' },
  { value: 'ARCH', label: 'Architecture (ARCH)' },
  { value: 'CE', label: 'Civil Engineering (CE)' },
  { value: 'CHE', label: 'Chemical Engineering (CHE)' },
  { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { value: 'EEE', label: 'Electrical & Electronic Engineering (EEE)' },
  { value: 'FE', label: 'Food Engineering (FE)' },
  { value: 'ME', label: 'Mechanical Engineering (ME)' },
  { value: 'IPE', label: 'Industrial & Production Engineering (IPE)' },
  { value: 'MME', label: 'Materials & Metallurgical Engineering (MME)' },
  { value: 'TE', label: 'Textile Engineering (TE)' },
];

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

const LIMIT_OPTIONS = ['10', '20', '50', 'all'];

const CombinedMeritPortal = () => {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [sorting, setSorting] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('25');

  // Server-side search state
  const [searchInput, setSearchInput] = useState('');
  const [backendSearch, setBackendSearch] = useState('');

  // Debounce search input to prevent aggressive network requests
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setBackendSearch(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const hasValidParams = Boolean(selectedDept && selectedSession);

  // RTK Query hooks sending page, limit, and backend search params
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetCombinedMeritListQuery(
    {
      departmentId: selectedDept,
      session: selectedSession,
      page: currentPage,
      limit: pageSize,
      search: backendSearch,
    },
    { skip: !hasValidParams },
  );

  const tableData = useMemo(() => apiResponse?.data || [], [apiResponse]);
  const metaData = useMemo(
    () => apiResponse?.meta || { totalPages: 1, totalRecords: 0 },
    [apiResponse],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'slNo',
        header: 'Sl. No.',
        cell: (info) => (
          <span className="flex items-center justify-center font-bold text-slate-500 w-7 h-7 rounded-full text-xs">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'rollNo',
        header: 'Roll No / ID',
        cell: (info) => (
          <span className="font-mono bg-indigo-50 border border-indigo-100/70 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 shadow-sm">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Student Name',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase shadow-inner border border-slate-200">
              {info.getValue().charAt(0)}
            </div>
            <span className="text-slate-800 font-semibold tracking-tight">
              {info.getValue()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'model1',
        header: 'Model - 1',
        cell: (info) => (
          <span className="text-slate-600 font-semibold px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-xs">
            {info.getValue() ?? 0}
          </span>
        ),
      },
      {
        accessorKey: 'model2',
        header: 'Model - 2',
        cell: (info) => (
          <span className="text-slate-600 font-semibold px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-xs">
            {info.getValue() ?? 0}
          </span>
        ),
      },
      {
        accessorKey: 'model3',
        header: 'Model - 3',
        cell: (info) => (
          <span className="text-slate-600 font-semibold px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-xs">
            {info.getValue() ?? 0}
          </span>
        ),
      },
      {
        accessorKey: 'totalMarks',
        header: 'Total Marks',
        cell: (info) => (
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs md:text-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-3 py-1 rounded shadow-sm">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'rank',
        header: 'Ranking',
        cell: (info) => {
          const rank = Number(info.getValue());
          const rankStyles = {
            1: {
              text: 'text-amber-700 dark:text-amber-400 font-extrabold',
              bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
              border: 'border-amber-200 dark:border-amber-800/50',
              icon: 'text-amber-500 animate-bounce-slow',
            },
            2: {
              text: 'text-slate-700 dark:text-slate-300 font-bold',
              bg: 'from-slate-50 to-zinc-100 dark:from-slate-900/40 dark:to-zinc-900/40',
              border: 'border-slate-200 dark:border-slate-800',
              icon: 'text-slate-400',
            },
            3: {
              text: 'text-orange-700 dark:text-orange-400 font-bold',
              bg: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
              border: 'border-orange-200/80 dark:border-orange-900/50',
              icon: 'text-orange-500',
            },
            4: {
              text: 'text-emerald-700 dark:text-emerald-400 font-semibold',
              bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
              border: 'border-emerald-200/60 dark:border-emerald-900/40',
              icon: 'text-emerald-500',
            },
            5: {
              text: 'text-blue-700 dark:text-blue-400 font-semibold',
              bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
              border: 'border-blue-200/60 dark:border-blue-900/40',
              icon: 'text-blue-500',
            },
          };

          if (rankStyles[rank]) {
            const currentStyle = rankStyles[rank];

            return (
              <span
                className={`inline-flex items-center gap-1.5 text-xs md:text-sm bg-gradient-to-r border px-3 py-1 rounded-full shadow-sm transition-all duration-200 ${currentStyle.text} ${currentStyle.bg} ${currentStyle.border}`}
              >
                <Trophy className={`w-3.5 h-3.5 ${currentStyle.icon}`} />
                {rank}
              </span>
            );
          }

          return (
            <span className="text-gray-500 dark:text-gray-400 font-medium pl-4 text-xs md:text-sm">
              {rank}
            </span>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExportCSV = () => {
    // 1. Guard clause to prevent empty file generation
    if (!tableData.length) return;

    // 2. Generate current client-side export timestamp in 'DD-MM-YYYY HH:mm' format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;

    // Helper utility to safely escape commas and double quotes within fields
    const escapeField = (field) => {
      if (field === null || field === undefined) return '""';
      const stringified = String(field);
      // If string contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
      if (
        stringified.includes('"') ||
        stringified.includes(',') ||
        stringified.includes('\n') ||
        stringified.includes('\r')
      ) {
        return `"${stringified.replaceAll('"', '""')}"`;
      }
      return `"${stringified}"`;
    };

    // 3. Build Enterprise Top Header & Company Metadata Metadata rows
    const csvRows = [
      escapeField('RPR DUET Admission Care'),
      `${escapeField('Address: M.A. Samad Villa In front of DUET Campus')},${escapeField('Gazipur, Bangladesh')}`,
      `${escapeField('Contacts: +880 1742-590128 | +880 1901-852989')},${escapeField('Email: rpr.group2013@gmail.com')}`,
      '', // Blank spacing row for visual separation inside Excel sheet
      `${escapeField('Department:')},${escapeField(selectedDept || 'N/A')},${escapeField('Session:')},${escapeField(selectedSession || 'N/A')}`,
      `${escapeField('Export Date & Time:')},${escapeField(formattedDateTime)}`,
      '', // Blank spacing row before data structure
    ];

    // 4. Standard Data Structure Headers Definition
    const dataHeaders = [
      'Sl. No.',
      'Roll No',
      'Name',
      'Model-1',
      'Model-2',
      'Model-3',
      'Total Marks',
      'Ranking',
    ];
    csvRows.push(dataHeaders.map((h) => escapeField(h)).join(','));

    // 5. Inject actual row values iteratively mapped safely
    tableData.forEach((row) => {
      const rowData = [
        row.slNo,
        row.rollNo,
        row.name,
        row.model1 ?? 0,
        row.model2 ?? 0,
        row.model3 ?? 0,
        row.totalMarks ?? 0,
        row.rank,
      ];
      csvRows.push(rowData.map((field) => escapeField(field)).join(','));
    });

    // 6. Force clean UTF-8 compilation using standard Byte Order Mark (\uFEFF)
    // This strictly prevents Excel from corrupting localized characters or formats upon parsing
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // 7. Initialize clean trigger mechanics for DOM download download channel
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Combined_Merit_${selectedDept || 'NA'}_${selectedSession || 'NA'}.csv`,
    );

    document.body.appendChild(link);
    link.click();

    // 8. Garbage collection memory cleanup workflows
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleClearFilters = () => {
    setSelectedDept('');
    setSelectedSession('');
    setSearchInput('');
    setBackendSearch('');
    setSorting([]);
    setCurrentPage(1);
    setPageSize('25');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-700 antialiased font-sans">
      {/* Notion Style Cover Banner */}
      <div className="relative w-full h-44 bg-gradient-to-r from-slate-100 via-slate-200/70 to-zinc-100 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-2xl"></div>
      </div>

      <main className="mx-auto px-5 sm:px-6 lg:px-5 -mt-12 relative z-10 pb-16 space-y-6">
        {/* Notion Avatar/Icon Box */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded bg-white border border-slate-200/80 shadow-md p-5 text-4xl select-none">
          🎓
        </div>

        {/* Notion Title & Metadata */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-900 sm:text-3xl">
            Combined Merit Registry
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
            Administrators can search global records, analyze examinee metadata
            structures, and handle batch records deletion seamlessly.
          </p>
        </div>

        {/* Main Content Box containing Controls and Table */}
        <div className="bg-white rounded border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
          {/* Header Controls: Filters and Search all in one clean panel */}
          <div className="bg-slate-50/70 p-5 border-b border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200/60 pb-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              Merit list management
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Department Select */}
              <div className="md:col-span-4 relative">
                <label
                  htmlFor="department-select"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />{' '}
                  Department
                </label>
                <select
                  id="department-select"
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Select */}
              <div className="md:col-span-3">
                <label
                  htmlFor="session-select"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                >
                  Session
                </label>
                <select
                  id="session-select"
                  value={selectedSession}
                  onChange={(e) => {
                    setSelectedSession(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                >
                  {SESSIONS.map((session) => (
                    <option key={session.value} value={session.value}>
                      {session.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Power Search (Backend Integrated) */}
              <div className="md:col-span-3">
                <label
                  htmlFor="merit-search"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" /> Search Roll
                  / Name
                </label>
                <div className="relative w-full">
                  <span className="absolute left-3.5 top-3.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="merit-search"
                    type="text"
                    value={searchInput}
                    disabled={!hasValidParams}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={
                      hasValidParams
                        ? 'Type Roll or Student name...'
                        : 'Select params first...'
                    }
                    className="bg-white border border-slate-200 rounded pl-10 pr-4 py-2 text-sm w-full outline-none shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Global Action buttons */}
              <div className="md:col-span-2 flex gap-2">
                {tableData?.length > 0 && !isLoading && (
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold h-[42px] px-4 rounded shadow-md transition-all active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" /> Export
                  </button>
                )}
                {(selectedDept || selectedSession || searchInput) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 h-[42px] bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border border-slate-200 rounded transition-all shadow-sm active:scale-[0.98]"
                    title="Clear All Filters"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table View Manager with Colorful Styling */}
          <div className="w-full relative">
            {!hasValidParams && (
              <div className="bg-white py-28 text-center px-4 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 text-indigo-500">
                  <SlidersHorizontal className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Parameters Selection Required
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Please select both the department and the academic session
                  from the configuration bar above to load indices and
                  marksheets.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-white py-32 flex flex-col items-center justify-center">
                <Loader />
                <span className="text-xs font-semibold text-slate-400 mt-4 animate-pulse">
                  Fetching records...
                </span>
              </div>
            )}

            {isError && (
              <div className="bg-white py-20 px-4">
                <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto shadow-sm">
                  <p className="text-sm font-bold text-rose-700">
                    {error?.data?.message ||
                      'An unexpected microservice or network connection failure occurred.'}
                  </p>
                </div>
              </div>
            )}

            {hasValidParams && !isLoading && !isError && (
              <div className="space-y-0">
                <div className="overflow-x-auto">
                  <table
                    className={`min-w-full divide-y divide-slate-200 ${isFetching ? 'opacity-50 pointer-events-none transition-opacity duration-200' : ''}`}
                  >
                    <thead className="bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200 select-none">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler()}
                              className="px-6 py-4 font-bold text-left text-[11px] text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-1.5">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                {header.column.getCanSort() && (
                                  <span className="text-slate-300 group-hover:text-slate-500 text-[10px]">
                                    ↕️
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {tableData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="px-6 py-20 text-center text-sm font-semibold text-slate-400"
                          >
                            No matching records found for this criteria.
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-6 py-3.5 text-sm whitespace-nowrap text-slate-600 font-medium"
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

                {/* Pagination Controls Panel inside Tanstack Container */}
                {tableData?.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50/70 px-6 py-4 border-t border-slate-200 text-sm gap-4 select-none">
                    <div className="flex items-center gap-6 text-slate-400 text-xs font-semibold">
                      <div>
                        Page{' '}
                        <span className="text-slate-800 font-bold">
                          {metaData.currentPage}
                        </span>{' '}
                        of{' '}
                        <span className="text-slate-800 font-bold">
                          {metaData.totalPages}
                        </span>
                      </div>
                      <div className="h-4 w-[1px] bg-slate-300" />
                      <div>
                        Total{' '}
                        <span className="text-indigo-600 font-bold">
                          {metaData.totalRecords}
                        </span>{' '}
                        Results
                      </div>

                      {/* Dynamic Page Limit setup selection integrated inside pagination bar */}
                      <div className="h-4 w-[1px] bg-slate-300" />
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Rows:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="bg-white border border-slate-200 rounded text-xs px-2 py-1 font-bold text-slate-700 cursor-pointer shadow-sm outline-none"
                        >
                          <option value="25">25</option>
                          {LIMIT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {pageSize !== 'all' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1 || isFetching}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition-all active:scale-[0.97]"
                        >
                          <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, metaData.totalPages),
                            )
                          }
                          disabled={
                            currentPage === metaData.totalPages || isFetching
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition-all active:scale-[0.97]"
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CombinedMeritPortal;
