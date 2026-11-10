import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import {
  useDeleteMeritRecordsMutation,
  useGetMeritRecordsQuery,
} from "../services/meritApi";
import { MeritRecord, SessionOption } from "../types/Merit.types";

const generateSessions = (): SessionOption[] => {
  const startBaseYear = 2023;
  const currentYear = new Date().getFullYear();
  const targetEndYear = currentYear + 2;
  const sessionsList: SessionOption[] = [
    { value: "", label: "Select a Session" },
  ];
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

const MeritRegistryDashboard: React.FC = () => {
  //---------------------------------------------------------
  // 1. Server-Side Operational States
  //---------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");

  // Debounced states to coordinate single-flight server hits
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [debouncedModel, setDebouncedModel] = useState<string>("");
  const [debouncedDate, setDebouncedDate] = useState<string>("");
  const [debouncedSession, setDebouncedSession] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | "all">(10);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

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

  const apiData: MeritRecord[] = response?.data || [];

  const pagination = response?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const isAllMode = pageSize === "all";

  //---------------------------------------------------------
  // 3. Command Context Handlers
  //---------------------------------------------------------
  const handleDeleteRecords = useCallback(
    async (targetIds: string[]) => {
      if (!targetIds || targetIds.length === 0) return;

      const confirmMessage = `Are you sure you want to permanently delete ${targetIds.length} selected record(s)?`;
      if (!window.confirm(confirmMessage)) return;

      try {
        const res = (await deleteMeritRecords(targetIds).unwrap()) as {
          message?: string;
        };
        setRowSelection({});
        alert(
          res?.message || `Successfully deleted ${targetIds.length} record(s).`,
        );
      } catch (err: unknown) {
        const error = err as { data?: { message?: string } };
        alert(error?.data?.message || "Operation failed.");
      }
    },
    [deleteMeritRecords],
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allSelected: Record<string, boolean> = {};
      apiData.forEach((row) => {
        allSelected[row._id] = true;
      });
      setRowSelection(allSelected);
    } else {
      setRowSelection({});
    }
  };

  const handleSelectRow = (id: string) => {
    setRowSelection((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection).filter(
      (id) => rowSelection[id],
    );
    handleDeleteRecords(selectedIds);
  };

  const isAllPageSelected =
    apiData.length > 0 && apiData.every((row) => rowSelection[row._id]);
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-20">
      {/* Cover Graphic Strip */}
      <div className="relative w-full h-44 bg-gradient-to-r from-slate-100 via-slate-200/70 to-zinc-100 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-2xl"></div>
      </div>

      {/* Content View Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 space-y-6">
        {/* Notion Structural Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl bg-white border border-slate-200/80 shadow-sm p-5 text-4xl select-none">
          🎓
        </div>

        {/* Dashboard Metadata Headers */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Students Merit Registry
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Direct Database Stream
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Academic Session 2023-24 onwards
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            This repository stores system-wide parsed merit datasets.
            Administrators can filter specific models, search criteria
            parameters, and execute safe bulk actions.
          </p>
        </div>

        {/* Core Registry Panel */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          {/* Integrated Toolbars & Filters */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
              {/* Multi-Parameter Filters Context */}
              <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-4xl">
                {/* Full-Text Query Search */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID or roll..."
                    className="bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg pl-10 pr-4 py-2 text-xs w-full outline-none transition-all font-medium placeholder:text-slate-400"
                  />
                  <div className="absolute left-3.5 top-3 flex items-center justify-center h-full pointer-events-none">
                    {isFetching ? (
                      <Loader2 className="animate-spin text-indigo-500 w-4 h-4" />
                    ) : (
                      <Search className="text-slate-400 w-4 h-4" />
                    )}
                  </div>
                </div>

                <div>
                  <select
                    value={selectedSession}
                    onChange={(e) => {
                      setSelectedSession(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
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
                    className="bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs w-full outline-none font-medium text-slate-700 appearance-none cursor-pointer pr-8"
                  >
                    <option value="">All Exam Models</option>
                    <option value="Model-1">Model-1</option>
                    <option value="Model-2">Model-2</option>
                    <option value="Model-3">Model-3</option>
                  </select>
                  <Filter className="absolute right-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>

                {/* Relational Exam Date Match Selector */}
                <div className="relative w-full sm:w-44">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs w-full outline-none font-medium text-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Batch Operation Trigger Controls */}
              <div className="flex items-center gap-2 justify-end shrink-0">
                {selectedCount > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 transition-colors text-xs font-semibold px-3.5 py-2 rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Delete Selected ({selectedCount})</span>
                  </button>
                )}
                <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider pl-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Merit Registry
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Desktop Structural Data Layout */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[950px] divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      checked={isAllPageSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                  <th className="px-4 py-3.5">Sl No</th>
                  <th className="px-4 py-3.5">Roll / ID</th>
                  <th className="px-4 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Dept</th>
                  <th className="px-4 py-3.5">Session</th>
                  <th className="px-4 py-3.5">Model</th>
                  <th className="px-4 py-3.5">Obtained Marks</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading || isFetching ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-20 text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="font-medium text-slate-600">
                          Please wait...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : apiData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-24 text-slate-400"
                    >
                      <div className="max-w-xs mx-auto space-y-2">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-slate-700">
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
                  apiData.map((row, index) => {
                    const currentLimit = isAllMode
                      ? pagination.totalItems
                      : Number(pageSize);
                    const computedIndex = isAllMode
                      ? index + 1
                      : (currentPage - 1) * currentLimit + index + 1;

                    const rawDate = row.examInfo?.examDate;
                    let formattedDate = "N/A";
                    if (rawDate) {
                      const dateObj = new Date(rawDate);
                      if (!isNaN(dateObj.getTime())) {
                        const day = String(dateObj.getDate()).padStart(2, "0");
                        const month = String(dateObj.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const year = dateObj.getFullYear();
                        formattedDate = `${day}-${month}-${year}`;
                      }
                    }

                    const marks = row?.data?.obtained__marks ?? "N/A";
                    const total = row?.examInfo?.totalMarks ?? "300";
                    const isSelected = !!rowSelection[row._id];

                    return (
                      <tr
                        key={row._id}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          isSelected ? "bg-indigo-50/30" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row._id)}
                            aria-label={`Select row ${computedIndex}`}
                          />
                        </td>
                        <td className="px-4 py-3.5 font-mono font-semibold text-slate-400">
                          {computedIndex}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                          {row.studentId}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {row.studentName}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {formattedDate}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                            {row.examInfo?.departmentId || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-500">
                          {row.examInfo?.session || "N/A"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                            {row.examInfo?.model || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-indigo-600">
                              {marks}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Out of {total}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteRecords([row._id])}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Operational Pagination Controls Bar */}
          {apiData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 p-4 border-t border-slate-100 text-xs font-medium text-slate-600">
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
                    className="inline-flex items-center justify-center p-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={
                      isAllMode || !pagination.hasNextPage || isFetching
                    }
                    className="inline-flex items-center justify-center p-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-slate-500">
                  {isAllMode ? (
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100/60">
                      All Data Stream Active
                    </span>
                  ) : (
                    <>
                      Page{" "}
                      <strong className="text-slate-800 font-bold">
                        {pagination.currentPage}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-slate-800 font-bold">
                        {pagination.totalPages}
                      </strong>
                    </>
                  )}
                </span>
              </div>

              {/* Right Dynamic Page Sizing Block */}
              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60">
                <span className="text-slate-500">
                  Total Items:{" "}
                  <strong className="text-slate-800 font-bold">
                    {pagination.totalItems}
                  </strong>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      setPageSize(nextVal === "all" ? "all" : Number(nextVal));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold shadow-2xs cursor-pointer outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {[10, 25, 50, 100, "all"].map((size) => (
                      <option key={size} value={size}>
                        {size === "all" ? "Show All Rows" : `${size} rows`}
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
