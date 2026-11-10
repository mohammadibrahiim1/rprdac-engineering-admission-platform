import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  ArrowUpDown,
} from "lucide-react";
import { useSaveMeritDataMutation } from "../services/meritApi";
import { useMeritParser } from "../hooks/useMeritParser";

// ==========================================
// Types & Interfaces
// ==========================================
export interface ExamInfoState {
  departmentId: string;
  session: string;
  model: string;
  examType: string;
  examDate: string;
  totalMarks: string | number;
  status: string;
}

export interface MetricItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export interface FieldConfig {
  id: keyof ExamInfoState;
  label: string;
  type: string;
  placeholder?: string;
  disabled?: boolean;
  icon: React.ElementType;
}

const INITIAL_EXAM_INFO: ExamInfoState = {
  departmentId: "",
  session: "",
  model: "",
  examType: "",
  examDate: "",
  totalMarks: "",
  status: "Draft",
};

const MeritListTable: React.FC = () => {
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

  // State Management with proper TypeScript typing
  const [examInfo, setExamInfo] = useState<ExamInfoState>(INITIAL_EXAM_INFO);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSizeSelection, setPageSizeSelection] = useState<string>("25");

  const parseDateInput = useCallback((dateStr?: string): string => {
    if (!dateStr) return "";
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
          return date.toISOString().split("T")[0];
        }
      }
    }
    return "";
  }, []);

  // Sync state with excel metadata parser safely
  useEffect(() => {
    if (
      (meta && Object.keys(meta).length > 0) ||
      (stats && Object.keys(stats).length > 0)
    ) {
      setExamInfo((prev) => ({
        departmentId:
          (meta as any)?.departmentId ||
          (meta as any)?.dept ||
          prev.departmentId,
        session:
          (meta as any)?.session || (stats as any)?.session || prev.session,
        model: (meta as any)?.model || prev.model || (stats as any)?.model,
        examType:
          (meta as any)?.exam || (stats as any)?.examName || prev.examType,
        examDate:
          parseDateInput((meta as any)?.date || (stats as any)?.date) ||
          prev.examDate,
        totalMarks:
          (meta as any)?.fullMarks ||
          (stats as any)?.fullMarks ||
          prev.totalMarks,
        status: prev.status,
      }));
    }
  }, [meta, stats, parseDateInput]);

  // Dynamic Column Key Discovery with strict typing guards
  const studentIdKey = useMemo(() => {
    const col = (columns as any[]).find(
      (c: any) =>
        c.header?.toLowerCase().includes("roll") ||
        c.accessorKey?.toLowerCase().includes("roll") ||
        c.header?.toLowerCase().includes("no") ||
        c.accessorKey?.toLowerCase().includes("no"),
    );
    return col && "accessorKey" in col ? String(col.accessorKey) : "roll_no";
  }, [columns]);

  const studentNameKey = useMemo(() => {
    const col = (columns as any[]).find(
      (c: any) =>
        c.header?.toLowerCase().includes("name") ||
        c.accessorKey?.toLowerCase().includes("name"),
    );
    return col && "accessorKey" in col ? String(col.accessorKey) : "name";
  }, [columns]);

  // Filter & Sort rows for Shadcn table
  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];

    // Global Search Filter
    if (globalFilter.trim()) {
      const query = globalFilter.toLowerCase();
      result = result.filter((row: any) =>
        Object.values(row).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(query),
        ),
      );
    }

    // Sorting
    if (sortColumn) {
      result.sort((a: any, b: any) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        return sortDirection === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [rows, globalFilter, sortColumn, sortDirection]);

  // Pagination calculation
  const pageSizeNumber =
    pageSizeSelection === "all"
      ? filteredAndSortedRows.length || 1
      : Number(pageSizeSelection);
  const totalPages =
    Math.ceil(filteredAndSortedRows.length / pageSizeNumber) || 1;

  const paginatedRows = useMemo(() => {
    if (pageSizeSelection === "all") return filteredAndSortedRows;
    const start = (currentPage - 1) * pageSizeNumber;
    return filteredAndSortedRows.slice(start, start + pageSizeNumber);
  }, [filteredAndSortedRows, currentPage, pageSizeNumber, pageSizeSelection]);

  const handleSort = (accessorKey: string) => {
    if (sortColumn === accessorKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(accessorKey);
      setSortDirection("asc");
    }
  };

  const handlePageSizeChange = (val: string) => {
    setPageSizeSelection(val);
    setCurrentPage(1);
  };

  const handleInputChange = (field: keyof ExamInfoState, value: string) => {
    setExamInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await parseExcel(file);
    e.target.value = "";
  };

  const handleFinalSubmit = async () => {
    const requiredFields: (keyof ExamInfoState)[] = [
      "departmentId",
      "session",
      "model",
      "examType",
      "examDate",
      "totalMarks",
    ];
    const hasEmptyField = requiredFields.some(
      (field) => !examInfo[field]?.toString().trim(),
    );

    if (hasEmptyField) {
      alert(
        "Validation Error: Please fill in all required Exam Information metadata fields.",
      );
      return;
    }

    if (!rows || rows.length === 0) {
      alert("Validation Error: No student dataset available to upload.");
      return;
    }

    try {
      const processedStudents = rows.map((row: any, idx: number) => {
        const rollNoRaw = row[studentIdKey]?.toString().trim() || "";
        const studentName = row[studentNameKey]?.toString().trim() || "";

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
    } catch (err: any) {
      alert(
        err?.message ||
          "Server Communication Error. Failed to secure merit record.",
      );
    }
  };

  const handleClearFilters = () => {
    setGlobalFilter("");
    setSortColumn(null);
    setSortDirection("asc");
    setCurrentPage(1);
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
              {(
                [
                  {
                    label: "Highest",
                    value: (stats as any)?.highest ?? "N/A",
                    icon: TrendingUp,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Lowest",
                    value: (stats as any)?.lowest ?? "N/A",
                    icon: TrendingDown,
                    color: "text-rose-600",
                    bg: "bg-rose-50",
                  },
                  {
                    label: "Total Rows",
                    value: `${rows.length}`,
                    icon: Users,
                    color: "text-indigo-600",
                    bg: "bg-indigo-50",
                  },
                ] as MetricItem[]
              ).map((metric, idx) => (
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

        {/* Shadcn UI Styled Table Container */}
        <div className="bg-white border border-slate-200/70 rounded-xl shadow-xs overflow-hidden">
          {/* Internal Toolbar (Search, Filter Clear, Inputs Parameters) */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/40 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Table Search bar */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  value={globalFilter ?? ""}
                  onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search students..."
                  className="bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-lg pl-10 pr-4 py-2 text-xs w-full outline-none transition-all font-semibold placeholder:text-slate-400"
                />
                <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  Parameters configuration
                </div>

                {(globalFilter || sortColumn) && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Parameter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
              {(
                [
                  {
                    id: "departmentId",
                    label: "Department",
                    type: "text",
                    placeholder: "e.g., Computer Science",
                    icon: Building2,
                  },
                  {
                    id: "session",
                    label: "Session",
                    type: "text",
                    placeholder: "e.g., 2023-24",
                    icon: Hash,
                  },
                  {
                    id: "model",
                    label: "Model / Tier",
                    type: "text",
                    placeholder: "Auto-extracting...",
                    disabled: true,
                    icon: Layers,
                  },
                  {
                    id: "examDate",
                    label: "Exam Date",
                    type: "date",
                    icon: Calendar,
                  },
                  {
                    id: "totalMarks",
                    label: "Total Marks",
                    type: "number",
                    placeholder: "e.g., 300",
                    icon: Award,
                  },
                ] as FieldConfig[]
              ).map((field) => (
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
                      className="w-full bg-white disabled:bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-lg pl-10 pr-3.5 py-2 text-xs outline-none transition-all font-semibold placeholder:text-slate-400/80 disabled:opacity-75"
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
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50/40 border border-indigo-100/60 p-3 rounded-lg animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                System executing Excel buffer stream diagnostics...
              </div>
            )}
            {parseError && (
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50/60 border border-rose-100 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                Extraction Failure: {parseError}
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/60 border border-emerald-100 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Safe Commit: Data successfully synchronized with database.
              </div>
            )}
            {isError && (
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50/60 border border-rose-100 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                Server Rejected Transaction:{" "}
                {(saveErrorObj as any)?.data?.message ||
                  "Atomic commit operation aborted."}
              </div>
            )}
          </div>

          {/* Shadcn UI Styled Table Presentation Layer */}
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-xs">
              <thead className="[&_tr]:border-b bg-slate-50/80">
                <tr className="border-b transition-colors">
                  {(columns as any[]).map((col: any) => (
                    <th
                      key={col.accessorKey || col.id}
                      onClick={() => handleSort(col.accessorKey)}
                      className="h-10 px-4 text-left align-middle font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{col.header}</span>
                        <span className="text-slate-400">
                          {sortColumn === col.accessorKey ? (
                            sortDirection === "asc" ? (
                              " 🔼"
                            ) : (
                              " 🔽"
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-50" />
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 divide-y divide-slate-100">
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row: any, rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100"
                    >
                      {(columns as any[]).map((col: any) => (
                        <td
                          key={col.accessorKey || col.id}
                          className="p-4 align-middle font-medium text-slate-700 whitespace-nowrap"
                        >
                          {row[col.accessorKey] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length || 1}
                      className="h-32 text-center text-slate-400 font-medium"
                    >
                      <div className="max-w-xs mx-auto space-y-2 py-8">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 mx-auto shadow-2xs">
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center p-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center p-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-2xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-slate-400 pl-1">
                  Page{" "}
                  <strong className="text-slate-800 font-semibold">
                    {currentPage}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-800 font-semibold">
                    {totalPages}
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
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold shadow-2xs transition-all cursor-pointer outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  {["5", "10", "25", "50"].map((size) => (
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
