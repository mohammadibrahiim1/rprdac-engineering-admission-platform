import React, { useState, useMemo, useEffect } from "react";
import { useGetCombinedMeritListQuery } from "../services/meritApi";

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
} from "lucide-react";
import {
  DepartmentOption,
  SessionOption,
  CombinedMeritItem,
  CombinedMeritMeta,
} from "../types/CombinedMerit.types";

const DEPARTMENTS: DepartmentOption[] = [
  { value: "", label: "Select a Department" },
  { value: "ARCH", label: "Architecture (ARCH)" },
  { value: "CE", label: "Civil Engineering (CE)" },
  { value: "CHE", label: "Chemical Engineering (CHE)" },
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "EEE", label: "Electrical & Electronic Engineering (EEE)" },
  { value: "FE", label: "Food Engineering (FE)" },
  { value: "ME", label: "Mechanical Engineering (ME)" },
  { value: "IPE", label: "Industrial & Production Engineering (IPE)" },
  { value: "MME", label: "Materials & Metallurgical Engineering (MME)" },
  { value: "TE", label: "Textile Engineering (TE)" },
];

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

const SESSIONS: SessionOption[] = generateSessions();

const LIMIT_OPTIONS: string[] = ["10", "20", "50", "all"];

interface RankStyle {
  text: string;
  bg: string;
  border: string;
  icon: string;
}

const CombinedMeritPortal: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<string>("25");

  // Server-side search state
  const [searchInput, setSearchInput] = useState<string>("");
  const [backendSearch, setBackendSearch] = useState<string>("");

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

  const tableData: CombinedMeritItem[] = useMemo(
    () => apiResponse?.data || [],
    [apiResponse],
  );

  const metaData: CombinedMeritMeta = useMemo(
    () =>
      apiResponse?.meta || { currentPage: 1, totalPages: 1, totalRecords: 0 },
    [apiResponse],
  );

  const handleExportCSV = (): void => {
    if (!tableData.length) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;

    const escapeField = (field: unknown): string => {
      if (field === null || field === undefined) return '""';
      const stringified = String(field);
      if (
        stringified.includes('"') ||
        stringified.includes(",") ||
        stringified.includes("\n") ||
        stringified.includes("\r")
      ) {
        return `"${stringified.replaceAll('"', '""')}"`;
      }
      return `"${stringified}"`;
    };

    const csvRows: string[] = [
      escapeField("RPR DUET Admission Care"),
      `${escapeField("Address: M.A. Samad Villa In front of DUET Campus")},${escapeField("Gazipur, Bangladesh")}`,
      `${escapeField("Contacts: +880 1742-590128 | +880 1901-852989")},${escapeField("Email: rpr.group2013@gmail.com")}`,
      "",
      `${escapeField("Department:")},${escapeField(selectedDept || "N/A")},${escapeField("Session:")},${escapeField(selectedSession || "N/A")}`,
      `${escapeField("Export Date & Time:")},${escapeField(formattedDateTime)}`,
      "",
    ];

    const dataHeaders = [
      "Sl. No.",
      "Roll No",
      "Name",
      "Model-1",
      "Model-2",
      "Model-3",
      "Total Marks",
      "Ranking",
    ];
    csvRows.push(dataHeaders.map((h) => escapeField(h)).join(","));

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
      csvRows.push(rowData.map((field) => escapeField(field)).join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Combined_Merit_${selectedDept || "NA"}_${selectedSession || "NA"}.csv`,
    );

    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleClearFilters = (): void => {
    setSelectedDept("");
    setSelectedSession("");
    setSearchInput("");
    setBackendSearch("");
    setCurrentPage(1);
    setPageSize("25");
  };

  const rtkError = error as { data?: { message?: string } } | undefined;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-700 antialiased font-sans">
      {/* Notion Style Cover Banner */}
      <div className="relative w-full h-44 bg-gradient-to-r from-slate-100 via-slate-200/70 to-zinc-100 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-2xl"></div>
      </div>

      <main className="mx-auto px-5 sm:px-6 lg:px-5 -mt-12 relative z-10 pb-16 space-y-6">
        {/* Notion Avatar/Icon Box */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl bg-white border border-slate-200/80 shadow-sm p-5 text-4xl select-none">
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
          {/* Header Controls */}
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
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />{" "}
                  Department
                </label>
                <select
                  id="department-select"
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
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
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
                >
                  {SESSIONS.map((session) => (
                    <option key={session.value} value={session.value}>
                      {session.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Power Search */}
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
                        ? "Type Roll or Student name..."
                        : "Select params first..."
                    }
                    className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm w-full outline-none shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Global Action buttons */}
              <div className="md:col-span-2 flex gap-2">
                {tableData?.length > 0 && !isLoading && (
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold h-[42px] px-4 rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Export
                  </button>
                )}
                {(selectedDept || selectedSession || searchInput) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 h-[42px] bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border border-slate-200 rounded-lg transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                    title="Clear All Filters"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table View Manager */}
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
                <span className="text-xs font-semibold text-slate-400 mt-4 animate-pulse">
                  Please wait...
                </span>
              </div>
            )}

            {isError && (
              <div className="bg-white py-20 px-4">
                <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto shadow-2xs">
                  <p className="text-sm font-bold text-rose-700">
                    {rtkError?.data?.message ||
                      "An unexpected microservice or network connection failure occurred."}
                  </p>
                </div>
              </div>
            )}

            {hasValidParams && !isLoading && !isError && (
              <div className="space-y-0">
                <div className="overflow-x-auto">
                  <table
                    className={`min-w-full divide-y divide-slate-200 text-left text-xs ${
                      isFetching
                        ? "opacity-50 pointer-events-none transition-opacity duration-200"
                        : ""
                    }`}
                  >
                    <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-4">Sl. No.</th>
                        <th className="px-6 py-4">Roll No / ID</th>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Model - 1</th>
                        <th className="px-6 py-4">Model - 2</th>
                        <th className="px-6 py-4">Model - 3</th>
                        <th className="px-6 py-4">Total Marks</th>
                        <th className="px-6 py-4">Ranking</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {tableData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-20 text-center text-sm font-semibold text-slate-400"
                          >
                            No matching records found for this criteria.
                          </td>
                        </tr>
                      ) : (
                        tableData.map((row) => {
                          const rank = Number(row.rank);
                          const rankStyles: Record<number, RankStyle> = {
                            1: {
                              text: "text-amber-700 dark:text-amber-400 font-extrabold",
                              bg: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
                              border:
                                "border-amber-200 dark:border-amber-800/50",
                              icon: "text-amber-500 animate-bounce-slow",
                            },
                            2: {
                              text: "text-slate-700 dark:text-slate-300 font-bold",
                              bg: "from-slate-50 to-zinc-100 dark:from-slate-900/40 dark:to-zinc-900/40",
                              border: "border-slate-200 dark:border-slate-800",
                              icon: "text-slate-400",
                            },
                            3: {
                              text: "text-orange-700 dark:text-orange-400 font-bold",
                              bg: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
                              border:
                                "border-orange-200/80 dark:border-orange-900/50",
                              icon: "text-orange-500",
                            },
                            4: {
                              text: "text-emerald-700 dark:text-emerald-400 font-semibold",
                              bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
                              border:
                                "border-emerald-200/60 dark:border-emerald-900/40",
                              icon: "text-emerald-500",
                            },
                            5: {
                              text: "text-blue-700 dark:text-blue-400 font-semibold",
                              bg: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
                              border:
                                "border-blue-200/60 dark:border-blue-900/40",
                              icon: "text-blue-500",
                            },
                          };

                          const nameStr = String(row.name ?? "");

                          return (
                            <tr
                              key={row.rollNo || row.slNo}
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              <td className="px-6 py-3.5">
                                <span className="flex items-center justify-center font-bold text-slate-500 w-7 h-7 rounded-full text-xs">
                                  {row.slNo}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                <span className="font-mono bg-indigo-50 border border-indigo-100/70 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 shadow-2xs">
                                  {row.rollNo}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase shadow-inner border border-slate-200">
                                    {nameStr.charAt(0)}
                                  </div>
                                  <span className="text-slate-800 font-semibold tracking-tight text-sm">
                                    {nameStr}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                <span className="text-slate-600 font-semibold px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-xs">
                                  {row.model1 ?? 0}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                <span className="text-slate-600 font-semibold px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-xs">
                                  {row.model2 ?? 0}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                <span className="text-slate-600 font-semibold px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-xs">
                                  {row.model3 ?? 0}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs md:text-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-3 py-1 rounded shadow-2xs">
                                  {row.totalMarks ?? 0}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 whitespace-nowrap">
                                {rankStyles[rank] ? (
                                  <span
                                    className={`inline-flex items-center gap-1.5 text-xs md:text-sm bg-gradient-to-r border px-3 py-1 rounded-full shadow-2xs transition-all duration-200 ${rankStyles[rank].text} ${rankStyles[rank].bg} ${rankStyles[rank].border}`}
                                  >
                                    <Trophy
                                      className={`w-3.5 h-3.5 ${rankStyles[rank].icon}`}
                                    />
                                    {rank}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 font-medium pl-4 text-xs md:text-sm">
                                    {rank}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls Panel */}
                {tableData?.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50/70 px-6 py-4 border-t border-slate-200 text-sm gap-4 select-none">
                    <div className="flex items-center gap-6 text-slate-400 text-xs font-semibold">
                      <div>
                        Page{" "}
                        <span className="text-slate-800 font-bold">
                          {metaData.currentPage}
                        </span>{" "}
                        of{" "}
                        <span className="text-slate-800 font-bold">
                          {metaData.totalPages}
                        </span>
                      </div>
                      <div className="h-4 w-[1px] bg-slate-300" />
                      <div>
                        Total{" "}
                        <span className="text-indigo-600 font-bold">
                          {metaData.totalRecords}
                        </span>{" "}
                        Results
                      </div>

                      <div className="h-4 w-[1px] bg-slate-300" />
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Rows:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 font-bold text-slate-700 cursor-pointer shadow-2xs outline-none"
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

                    {pageSize !== "all" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1 || isFetching}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs transition-all active:scale-[0.97] cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs transition-all active:scale-[0.97] cursor-pointer"
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
