import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Download,
  RefreshCw,
  Search,
  RotateCcw,
  User,
  Calendar,
  Layers,
  FileText,
  ArrowRight,
} from "lucide-react";

import ExcelJS from "exceljs";
import { useGetStudentsActivityLogsQuery } from "@/features/admin/studentPanel/services/api/studentApi";

const ActivityLogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlStudentId = searchParams.get("studentId") || "";
  const urlStartDate = searchParams.get("startDate") || "";
  const urlEndDate = searchParams.get("endDate") || "";
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlLimit = Number(searchParams.get("limit")) || 10;

  // সার্চ ইনপুটের লোকাল স্টেট
  const [searchId, setSearchId] = useState(urlStudentId);

  // RTK Query-র জন্য একচুয়াল ফিল্টার স্টেট
  const [filter, setFilter] = useState({
    studentId: urlStudentId,
    startDate: urlStartDate,
    endDate: urlEndDate,
    page: urlPage,
    limit: urlLimit,
  });

  // ফিল্টার স্টেট চেঞ্জ হলে URL সিঙ্ক করা
  useEffect(() => {
    const params = {};
    if (filter.studentId) params.studentId = filter.studentId;
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
    params.page = filter.page.toString();
    params.limit = filter.limit.toString();
    setSearchParams(params);
  }, [filter, setSearchParams]);

  // এপিআই হুক কল
  const { data, isLoading, isFetching, error } =
    useGetStudentsActivityLogsQuery(filter, {
      skip: !filter.studentId,
    });

  // সার্চ সাবমিট হ্যান্ডলার
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      setFilter((prev) => ({ ...prev, studentId: searchId.trim(), page: 1 }));
    }
  };

  // সম্পূর্ণ সার্চ ও ফিল্টার ক্লিয়ার করার লজিক
  const handleClearFilters = () => {
    setSearchId("");
    setFilter({
      studentId: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 10,
    });
    setSearchParams({});
  };

  const exportToExcel = async () => {
    if (!data?.logs || data.logs.length === 0) return;

    const formattedData = data.logs.map((log) => {
      const changes = Object.keys(log.updatedData || {})
        .map((key) => {
          const oldKey = `old${key.replace("new", "")}`;
          return `${key.replace("new", "")}: ${log.previousData?.[oldKey] || "n/a"} → ${log.updatedData[key]}`;
        })
        .join(" | ");

      return {
        "Action Type": log.actionType,
        "Message/Summary": log.message,
        "Performed By (Name)": log.performedBy?.name || "n/a",
        "Performed By (Role)": log.performedBy?.role || "n/a",
        "Changes History": changes || "No Dynamic Changes",
        "Date & Time (BD)": new Date(log.createdAt).toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Activity Logs");

    if (formattedData.length > 0) {
      const keys = Object.keys(formattedData[0]);
      worksheet.columns = keys.map((key) => ({
        header: key,
        key: key,
        width: 25,
      }));

      worksheet.getRow(1).font = { bold: true };
    }

    worksheet.addRows(formattedData);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `Logs_${data.student?.studentId || "Student"}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#37352f] font-sans antialiased selection:bg-[#dfdebe]">
      <div className="p-2 mx-auto space-y-6">
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-10 pt-10 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#37352f] flex items-center gap-2">
              <FileText className="text-indigo-500" size={28} /> Student
              Activity Logs
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Track system updates, data mutations, and administrative logs for
              individual student records.
            </p>
          </div>

          {data?.success && data?.logs?.length > 0 && (
            <button
              onClick={exportToExcel}
              className="inline-flex items-center justify-center gap-2 bg-[#238387] hover:bg-[#1f7276] text-white text-sm font-medium px-4 py-2 rounded shadow-sm transition-all self-start md:self-auto"
            >
              <Download size={16} /> Export to Excel
            </button>
          )}
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="rounded p-2">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            {/* Student ID Input */}
            <div className="lg:col-span-4 relative">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User size={12} /> Student ID{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute text-neutral-400 left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  required
                  placeholder="Enter Student ID (e.g., STD-001)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-[#fbfbfa] border border-neutral-200 rounded-lg pl-9 pr-3 py-2 text-sm text-[#37352f] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="lg:col-span-3">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={12} /> Start Date
              </label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full bg-[#fbfbfa] border border-neutral-200 rounded-lg p-2 text-sm text-[#37352f] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* End Date */}
            <div className="lg:col-span-3">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={12} /> End Date
              </label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full bg-[#fbfbfa] border border-neutral-200 rounded-lg p-2 text-sm text-[#37352f] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="lg:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all shadow-sm shadow-indigo-100 flex items-center justify-center gap-1.5"
              >
                Fetch
              </button>
              {(filter.studentId || filter.startDate || filter.endDate) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  title="Clear All Filters"
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 p-2 rounded-lg text-sm transition-all flex items-center justify-center border border-neutral-200"
                >
                  <RotateCcw size={18} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── TABLE VIEW / CONDITIONAL RENDERING ── */}
        <div className="bg-white border border-neutral-200 rounded shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-between relative">
          {/* Initial Clean State (No Search Triggered) */}
          {!filter.studentId && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-12 my-auto">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
                <Search size={22} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800">
                Begin Audit Lookup
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                Please provide a valid Student ID above to fetch the
                corresponding system activity history logs.
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-12 my-auto">
              <RefreshCw
                className="text-indigo-500 animate-spin mb-3"
                size={28}
              />
              <h3 className="text-sm font-semibold text-neutral-800">
                Querying Database
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Fetching logs, please wait standard calculation pipeline...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-12 my-auto">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3">
                ⚠️
              </div>
              <h3 className="text-sm font-semibold text-neutral-800">
                Data Synchronization Failed
              </h3>
              <p className="text-xs text-red-500 max-w-md mt-1 font-medium">
                {error?.data?.message ||
                  "An unexpected validation or internal token mismatch error occurred."}
              </p>
            </div>
          )}

          {/* Empty Log Results State */}
          {data?.success && data?.logs?.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-12 my-auto">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-3">
                <SlidersHorizontal size={20} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800">
                No History Records Found
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                No activity logs matched your current parameters or date
                criteria for this user.
              </p>
            </div>
          )}

          {/* Actual Data Table View */}
          {data?.success &&
            data?.student &&
            data?.logs?.length > 0 &&
            !isLoading && (
              <>
                {/* Student Profile Top Strip */}
                <div className="bg-[#fbfbfa] border-b border-neutral-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Active Target
                    </span>
                    <h3 className="text-base font-bold text-neutral-800 mt-1">
                      {data.student.studentName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-neutral-500">
                    <span className="bg-white border px-2.5 py-1 rounded shadow-2xs">
                      ID:{" "}
                      <strong className="text-neutral-700">
                        {data.student.studentId}
                      </strong>
                    </span>
                    <span className="bg-white border px-2.5 py-1 rounded shadow-2xs">
                      Batch:{" "}
                      <strong className="text-neutral-700">
                        {data.student.batch}
                      </strong>
                    </span>
                    <span className="bg-white border px-2.5 py-1 rounded shadow-2xs">
                      Session:{" "}
                      <strong className="text-neutral-700">
                        {data.student.session}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Responsive Table Wrapper */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#fbfbfa] text-xs font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-200">
                        <th className="px-5 py-3 w-1/6">Action Type</th>
                        <th className="px-5 py-3 w-1/4">Message/Note</th>
                        <th className="px-5 py-3 w-1/5">Performed By</th>
                        {/* 🔥 আপডেট করা কলাম হেডার */}
                        <th className="px-5 py-3 w-1/4 text-neutral-700 bg-neutral-50/50 font-bold border-x border-neutral-150">
                          Field Mutations (Previous → Updated)
                        </th>
                        <th className="px-5 py-3 w-1/6">Timestamp (BD)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-neutral-700 divide-y divide-neutral-150">
                      {data.logs.map((log, index) => (
                        <tr
                          key={index}
                          className="hover:bg-neutral-50/50 transition-colors"
                        >
                          {/* Action Type */}
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded">
                              {log.actionType}
                            </span>
                          </td>

                          {/* Message */}
                          <td className="px-5 py-3.5 text-neutral-600 font-medium max-w-xs break-words">
                            {log.message}
                          </td>

                          {/* Performed By User Snapshot */}
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-neutral-800">
                              {log.performedBy?.name || "System Automated"}
                            </div>
                            <div className="text-xs text-neutral-400 font-medium">
                              {log.performedBy?.role || "n/a"}
                            </div>
                          </td>

                          {/* 🔥 ফিক্সড এবং ক্লিনড ম্যুটেশন কলাম (Previous vs Updated Data) */}
                          <td className="px-5 py-3.5 space-y-2 border-x border-neutral-150 bg-neutral-50/20">
                            {log.updatedData &&
                            Object.keys(log.updatedData).length > 0 ? (
                              Object.keys(log.updatedData).map((key) => {
                                // 'newBatch' থেকে 'oldBatch' ডাইনামিক কি কনভার্ট লজিক
                                const rawFieldName = key.replace("new", "");
                                const oldKey = `old${rawFieldName}`;

                                // অবজেক্টের ভেতর থেকে ডেটা রিড করা (ফলব্যাকসহ)
                                const previousValue =
                                  log.previousData?.[oldKey] ??
                                  log.previousData?.[key] ??
                                  "n/a";
                                const updatedValue =
                                  log.updatedData[key] ?? "n/a";

                                return (
                                  <div
                                    key={key}
                                    className="bg-white border border-neutral-200 rounded-lg p-2 shadow-2xs space-y-1"
                                  >
                                    {/* ফিল্ডের নাম */}
                                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-sans">
                                      {rawFieldName
                                        .replace(/([A-Z])/g, " $1")
                                        .trim()}
                                    </div>

                                    {/* ওল্ড বনাম নিউ ভ্যালু কার্ড লেআউট */}
                                    <div className="flex items-center gap-2 text-xs font-mono">
                                      <span
                                        className="px-2 py-0.5 bg-red-50/80 border border-red-100 text-red-600 rounded font-medium max-w-[120px] truncate"
                                        title={String(previousValue)}
                                      >
                                        {String(previousValue)}
                                      </span>
                                      <ArrowRight
                                        size={12}
                                        className="text-neutral-400 shrink-0"
                                      />
                                      <span
                                        className="px-2 py-0.5 bg-green-50/80 border border-green-100 text-green-700 rounded font-bold max-w-[120px] truncate"
                                        title={String(updatedValue)}
                                      >
                                        {String(updatedValue)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-xs text-neutral-400 italic font-medium">
                                No state mutations captured
                              </span>
                            )}
                          </td>

                          {/* BD Localized Time */}
                          <td className="px-5 py-3.5 text-xs text-neutral-400 font-medium">
                            {new Date(log.createdAt).toLocaleString("en-BD", {
                              timeZone: "Asia/Dhaka",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── NOTION STYLE BOTTOM PAGINATION & LIMIT CONTROLS ── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 border-t border-neutral-200 bg-neutral-50/50">
                  <div className="flex items-center gap-4">
                    {/* Limit Control Dropdown */}
                    <div className="relative flex items-center bg-white border border-neutral-200 rounded-lg shadow-xs">
                      <Layers
                        size={14}
                        className="absolute pointer-events-none text-neutral-400 left-2.5"
                      />
                      <select
                        value={filter.limit}
                        onChange={(e) => {
                          setFilter((prev) => ({
                            ...prev,
                            limit: Number(e.target.value),
                            page: 1,
                          }));
                        }}
                        className="py-1.5 pl-8 pr-7 text-xs bg-transparent border-none outline-none text-[#37352f] font-medium cursor-pointer appearance-none"
                      >
                        <option value={10}>10 records</option>
                        <option value={20}>20 records</option>
                        <option value={50}>50 records</option>
                        <option value={100}>100 records</option>
                      </select>
                      <ChevronRight
                        size={12}
                        className="absolute pointer-events-none text-neutral-400 right-2 rotate-90"
                      />
                    </div>

                    <div className="text-xs font-medium text-neutral-400">
                      Showing Page{" "}
                      <span className="text-neutral-700">
                        {data.pagination.currentPage || 1}
                      </span>{" "}
                      of{" "}
                      <span className="text-neutral-700">
                        {data.pagination.totalPages || 1}
                      </span>
                      <span className="ml-1">
                        ({data.pagination.totalLogs || 0} items total)
                      </span>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={filter.page === 1 || isFetching}
                      onClick={() =>
                        setFilter((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      className="inline-flex items-center justify-center w-8 h-8 transition-colors bg-white border rounded-lg shadow-xs text-neutral-600 border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <button
                      disabled={
                        filter.page >= (data.pagination.totalPages || 1) ||
                        isFetching
                      }
                      onClick={() =>
                        setFilter((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      className="inline-flex items-center justify-center w-8 h-8 transition-colors bg-white border rounded-lg shadow-xs text-neutral-600 border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}

          {/* Quick Loading Overlay for fast Pagination Swaps */}
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
