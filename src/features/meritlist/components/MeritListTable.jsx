import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Layers,
  Award,
  Hash,
  Building2,
  FileText,
  Database,
} from 'lucide-react';
import { useMeritParser } from '../hooks/useMeritParser';
import { useSaveMeritDataMutation } from '../services/meritApi';
import BreadCrumbMenu from '../../../../components/BreadCrumbMenu';

const INITIAL_EXAM_INFO = {
  departmentId: '',
  session: '',
  model: '',
  examType: '',
  examDate: '',
  totalMarks: '',
  status: 'Draft',
};

const MeritListTable = () => {
  const {
    loading: isParsing,
    rows = [],
    columns = [],
    error: parseError,
    stats = {},
    parseExcel,
    fileDetails,
    meta = {},
  } = useMeritParser();

  const [
    saveMeritData,
    { isLoading: isSaving, isSuccess, isError, error: saveErrorObj },
  ] = useSaveMeritDataMutation();

  // State Management
  const [examInfo, setExamInfo] = useState(INITIAL_EXAM_INFO);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [pageSizeSelection, setPageSizeSelection] = useState('25');

  const parseDateInput = useCallback((dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split(/[/-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1000) {
        const date = new Date(year, month - 1, day);
        if (
          date.getDate() === day &&
          date.getMonth() === month - 1 &&
          date.getFullYear() === year
        ) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    return '';
  }, []);

  // Sync state with excel metadata parser
  useEffect(() => {
    if (Object.keys(meta).length > 0 || Object.keys(stats).length > 0) {
      setExamInfo((prev) => ({
        departmentId: meta?.departmentId || meta?.dept || prev.departmentId,
        session: meta?.session || stats?.session || prev.session,
        model: meta?.model || prev.model || stats?.model,
        examType: meta?.exam || stats?.examName || prev.examType,
        examDate: parseDateInput(meta?.date || stats?.date) || prev.examDate,
        totalMarks: meta?.fullMarks || stats?.fullMarks || prev.totalMarks,
        status: prev.status,
      }));
    }
  }, [meta, stats, parseDateInput]);

  // Dynamic Column Key Discovery
  const studentIdKey = useMemo(() => {
    const col = columns.find(
      (c) =>
        c.header?.toLowerCase().includes('roll') ||
        c.accessorKey?.toLowerCase().includes('roll') ||
        c.header?.toLowerCase().includes('no') ||
        c.accessorKey?.toLowerCase().includes('no'),
    );
    return col ? col.accessorKey : 'roll_no';
  }, [columns]);

  const studentNameKey = useMemo(() => {
    const col = columns.find(
      (c) =>
        c.header?.toLowerCase().includes('name') ||
        c.accessorKey?.toLowerCase().includes('name'),
    );
    return col ? col.accessorKey : 'name';
  }, [columns]);

  // TanStack Table Instance
  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handlePageSizeChange = (val) => {
    setPageSizeSelection(val);
    if (val === 'all') {
      setPagination((prev) => ({
        ...prev,
        pageSize: rows.length || 1000,
        pageIndex: 0,
      }));
    } else {
      setPagination((prev) => ({
        ...prev,
        pageSize: Number(val),
        pageIndex: 0,
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setExamInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await parseExcel(file);
    e.target.value = '';
  };

  const handleFinalSubmit = async () => {
    const requiredFields = [
      'departmentId',
      'session',
      'model',
      'examType',
      'examDate',
      'totalMarks',
    ];
    const hasEmptyField = requiredFields.some(
      (field) => !examInfo[field]?.toString().trim(),
    );

    if (hasEmptyField) {
      alert(
        'Validation Error: Please fill in all required Exam Information metadata fields.',
      );
      return;
    }

    if (!rows || rows.length === 0) {
      alert('Validation Error: No student dataset available to upload.');
      return;
    }

    try {
      const processedStudents = rows.map((row, idx) => {
        const rollNoRaw = row[studentIdKey]?.toString().trim() || '';
        const studentName = row[studentNameKey]?.toString().trim() || '';

        if (!rollNoRaw || !studentName) {
          throw new Error(
            `Data Integrity Failure: Missing Student Roll at row ${idx + 1}`,
          );
        }

        const rollNo = Number(rollNoRaw);
        if (isNaN(rollNo)) {
          throw new Error(
            `Data Validation Error: Roll number at row ${idx + 1} is not a valid number.`,
          );
        }

        const {
          [studentIdKey]: _,
          [studentNameKey]: __,
          ...marksPayload
        } = row;

        return {
          studentId: rollNo,
          studentName,
          rowNumber: idx + 1,
          data: {
            roll_no: rollNo,
            ...marksPayload,
          },
        };
      });

      const finalPayload = {
        examInfo: {
          departmentId: examInfo.departmentId,
          session: examInfo.session,
          model: examInfo.model,
          examType: examInfo.examType,
          examDate: new Date(examInfo.examDate).toISOString(),
          totalMarks: Number(examInfo.totalMarks),
          status: examInfo.status,
        },
        students: processedStudents,
      };

      await saveMeritData(finalPayload).unwrap();
    } catch (err) {
      alert(
        err?.message ||
          'Server Communication Error. Failed to secure merit record.',
      );
    }
  };

  const handleClearFilters = () => {
    setGlobalFilter('');
    setSorting([]);
    table.resetSorting(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="relative w-full h-44 bg-gradient-to-r from-slate-100 via-slate-200/70 to-zinc-100 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-2xl"></div>
      </div>

      {/* Main Body Content with consistent padding */}
      <div className="mx-auto px-5 sm:px-6 lg:px-5 -mt-12 relative z-10 pb-16 space-y-6">
        {/* Notion Avatar/Icon Box */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded bg-white border border-slate-200/80 shadow-md p-5 text-4xl select-none">
          🎓
        </div>

        {/* Notion Title & Metadata */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-900 sm:text-3xl">
            Upload Merit Registry
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

        {/* Action controls & metrics (Directly above the table structure) */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* Left Side: Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="inline-flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/80 transition-all duration-150 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded shadow-sm w-full sm:w-auto focus-within:ring-2 focus-within:ring-indigo-500/20">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Select Excel File
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {fileDetails?.name && rows.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200/50 px-3 py-2 rounded text-xs font-semibold text-slate-600 max-w-[280px] sm:max-w-xs md:max-w-sm">
                <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate tracking-tight">
                  {fileDetails.name}
                </span>
                <span className="text-[10px] bg-slate-200/80 text-slate-500 px-1.5 py-0.5 rounded-md shrink-0 font-bold">
                  {fileDetails.size}
                </span>
              </div>
            )}

            {rows.length > 0 && (
              <button
                onClick={handleFinalSubmit}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white transition-all duration-150 text-xs font-semibold px-4 py-2.5 rounded shadow-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-indigo-100"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Save To Server
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Side: Mini Metrics */}
          {rows.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
              {[
                {
                  label: 'Highest',
                  value: stats?.highest ?? 'N/A',
                  icon: TrendingUp,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                },
                {
                  label: 'Lowest',
                  value: stats?.lowest ?? 'N/A',
                  icon: TrendingDown,
                  color: 'text-rose-600',
                  bg: 'bg-rose-50',
                },
                {
                  label: 'Total Rows',
                  value: `${rows.length}`,
                  icon: Users,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50',
                },
              ].map((metric, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/60 rounded shadow-sm min-w-[110px] shrink-0"
                >
                  <div className={`p-1 rounded-lg ${metric.bg}`}>
                    <metric.icon className={`w-3.5 h-3.5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {metric.label}
                    </p>
                    <p className="text-xs font-extrabold text-slate-700">
                      {metric.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive TanStack Table Container */}
        <div className="bg-white border border-slate-200/70 rounded shadow-sm overflow-hidden">
          {/* Internal Toolbar (Search, Filter Clear, Inputs Parameters) */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/40 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Table Search bar */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search students..."
                  className="bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded pl-10  pr-4 py-2 text-xs w-full outline-none transition-all font-semibold placeholder:text-slate-400"
                />
                <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  Parameters configuration
                </div>

                {(globalFilter || sorting.length > 0) && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm"
                  >
                    <X className="w-3 h-3" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Parameter Inputs Grid (Bug Fixed & Aligned) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
              {[
                {
                  id: 'departmentId',
                  label: 'Department',
                  type: 'text',
                  placeholder: 'e.g., Computer Science',
                  icon: Building2,
                },
                {
                  id: 'session',
                  label: 'Session',
                  type: 'text',
                  placeholder: 'e.g., 2023-24',
                  icon: Hash,
                },
                {
                  id: 'model',
                  label: 'Model / Tier',
                  type: 'text',
                  placeholder: 'Auto-extracting...',
                  disabled: true,
                  icon: Layers,
                },
                {
                  id: 'examDate',
                  label: 'Exam Date',
                  type: 'date',
                  icon: Calendar,
                },
                {
                  id: 'totalMarks',
                  label: 'Total Marks',
                  type: 'number',
                  placeholder: 'e.g., 300',
                  icon: Award,
                },
              ].map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
                    {field.label}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={field.type}
                      required
                      disabled={field.disabled}
                      value={examInfo[field.id]}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full bg-white disabled:bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded pl-10 pr-3.5 py-2 text-xs outline-none transition-all font-semibold placeholder:text-slate-400/80 disabled:opacity-75"
                    />
                    <div className="absolute left-3 flex items-center justify-center pointer-events-none">
                      <field.icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toast / Status Area */}
          <div className="px-5 pt-3 space-y-2">
            {isParsing && (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50/40 border border-indigo-100/60 p-3 rounded animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                System executing Excel buffer stream diagnostics...
              </div>
            )}
            {parseError && (
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50/60 border border-rose-100 p-3 rounded">
                <AlertTriangle className="w-4 h-4" />
                Extraction Failure: {parseError}
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/60 border border-emerald-100 p-3 rounded">
                <CheckCircle2 className="w-4 h-4" />
                Safe Commit: Data successfully synchronized with database.
              </div>
            )}
            {isError && (
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50/60 border border-rose-100 p-3 rounded">
                <AlertTriangle className="w-4 h-4" />
                Server Rejected Transaction:{' '}
                {saveErrorObj?.data?.message ||
                  'Atomic commit operation aborted.'}
              </div>
            )}
          </div>

          {/* TanStack Table Data Presentation Layer */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60 table-fixed sm:table-auto">
              <thead className="bg-slate-50/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-6 py-3.5 font-bold text-left text-[11px] text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <span className="text-slate-300 font-normal">
                            {{ asc: ' 🔼', desc: ' 🔽' }[
                              header.column.getIsSorted()
                            ] ?? ' ↕️'}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/40 transition-colors duration-100"
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
                ))}
                {rows.length === 0 && !isParsing && (
                  <tr>
                    <td
                      colSpan={columns.length || 1}
                      className="text-center py-24 text-xs text-slate-400 font-medium bg-white"
                    >
                      <div className="max-w-xs mx-auto space-y-2">
                        <div className="w-10 h-10 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-700">
                          No active buffer found
                        </p>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Load a valid target spreadsheet file (.xlsx) from the
                          top-left button to begin analytics processing.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {rows.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 p-4 border-t border-slate-100 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="inline-flex items-center justify-center p-2 border border-slate-200 rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="inline-flex items-center justify-center p-2 border border-slate-200 rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-slate-400 pl-1">
                  Page{' '}
                  <strong className="text-slate-800 font-semibold">
                    {table.getState().pagination.pageIndex + 1}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-slate-800 font-semibold">
                    {table.getPageCount()}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">
                  Rows per page:
                </span>
                <select
                  value={pageSizeSelection}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-700 font-semibold shadow-sm transition-all cursor-pointer outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  {['5', '10', '25', '50'].map((size) => (
                    <option key={size} value={size}>
                      {size} rows
                    </option>
                  ))}
                  <option value="all">All records ({rows.length})</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeritListTable;
