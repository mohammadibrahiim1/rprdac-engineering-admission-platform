import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Award,
  BookOpen,
  Phone,
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useGetResultSheetsQuery } from "../services/examApi";

// ডেমো ব্যাচ লিস্ট
const AVAILABLE_BATCHES = ["Alpha", "Beta", "Gamma", "Delta"];

const AVAILABLE_EXAMS = [
  { id: "6aeef091760a04c07407f7cb", title: "Model Test 2", date: "2026-11-07" },
  { id: "6aeef091760a04c07407f7cc", title: "Model Test 1", date: "2026-11-01" },
  {
    id: "6aeef091760a04c07407f7cd",
    title: "Final Assessment",
    date: "2026-10-25",
  },
];

export default function ResultSheetList() {
  const [studentId, setStudentId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedExamId, setSelectedExamId] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number | string>(30);

  // Dropdown States
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [examSearch, setExamSearch] = useState("");

  const batchRef = useRef<HTMLDivElement>(null);
  const examRef = useRef<HTMLDivElement>(null);

  // RTK Query
  const { data, isLoading, isError, refetch } = useGetResultSheetsQuery({
    studentId,
    batch: selectedBatch,
    examId: selectedExamId,
    page,
    limit,
  });

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        batchRef.current &&
        !batchRef.current.contains(event.target as Node)
      ) {
        setIsBatchOpen(false);
      }
      if (examRef.current && !examRef.current.contains(event.target as Node)) {
        setIsExamOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredExams = AVAILABLE_EXAMS.filter((exam) =>
    exam.title.toLowerCase().includes(examSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* --- HEADER SECTION --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Student Examination Results
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, search and filter student performance reports effortlessly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </motion.div>

      {/* --- FILTERS & SEARCH BAR (Shadcn Style) --- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mx-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {/* 1. Student ID Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Search Student ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. EEE-2002"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* 2. Batch Dropdown */}
        <div className="space-y-1.5 relative" ref={batchRef}>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Batch Filter
          </label>
          <div
            onClick={() => setIsBatchOpen(!isBatchOpen)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors"
          >
            <span className="font-medium text-slate-700">
              {selectedBatch === "all" ? "All Batches" : selectedBatch}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          <AnimatePresence>
            {isBatchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
              >
                <div
                  onClick={() => {
                    setSelectedBatch("all");
                    setIsBatchOpen(false);
                    setPage(1);
                  }}
                  className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-700 transition-colors"
                >
                  All Batches
                </div>
                {AVAILABLE_BATCHES.map((batch) => (
                  <div
                    key={batch}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setIsBatchOpen(false);
                      setPage(1);
                    }}
                    className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 transition-colors"
                  >
                    {batch}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Searchable Exam Dropdown */}
        <div className="space-y-1.5 relative" ref={examRef}>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filter by Exam
          </label>
          <div
            onClick={() => setIsExamOpen(!isExamOpen)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors"
          >
            <span className="font-medium text-slate-700 truncate">
              {selectedExamId === "all"
                ? "All Exams"
                : AVAILABLE_EXAMS.find((e) => e.id === selectedExamId)?.title ||
                  "Select Exam"}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          <AnimatePresence>
            {isExamOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search exam..."
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div
                  onClick={() => {
                    setSelectedExamId("all");
                    setIsExamOpen(false);
                    setPage(1);
                  }}
                  className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-700 transition-colors"
                >
                  All Exams
                </div>
                {filteredExams.map((exam) => (
                  <div
                    key={exam.id}
                    onClick={() => {
                      setSelectedExamId(exam.id);
                      setIsExamOpen(false);
                      setPage(1);
                    }}
                    className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm transition-colors flex flex-col"
                  >
                    <span className="font-medium text-slate-800">
                      {exam.title}
                    </span>
                    <span className="text-xs text-slate-400">{exam.date}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Limit Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Rows per page
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(
                e.target.value === "all" ? "all" : Number(e.target.value),
              );
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
          >
            <option value={10}>10 Rows</option>
            <option value={30}>30 Rows</option>
            <option value={50}>50 Rows</option>
            <option value="all">All Data</option>
          </select>
        </div>
      </motion.div>

      {/* --- TABLE CONTAINER --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden capitalize"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Loading...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-rose-500 gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium">
              Failed to retrieve data. Please try again.
            </p>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <BookOpen className="w-8 h-8 text-slate-300" />
            <p className="text-sm font-medium">
              No result sheets found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4">Student Info</th>
                  <th className="px-6 py-4">Batch / Dept</th>
                  <th className="px-6 py-4">Exam Details</th>
                  <th className="px-6 py-4">MCQ Performance</th>
                  <th className="px-6 py-4">Written</th>
                  <th className="px-6 py-4">Total & Percentage</th>
                  <th className="px-6 py-4">Merit</th>
                  <th className="px-6 py-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.data?.map((item: any, index: number) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    key={item._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-xs text-blue-600 font-mono mt-0.5">
                        {item.studentId}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {item.phone}
                      </div>
                    </td>

                    {/* Batch & Dept */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        {item.batch}
                      </span>
                      <div className="text-xs text-slate-500 mt-1 font-medium">
                        {item.department}
                      </div>
                    </td>

                    {/* Exam Details */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        {item.examId?.title || "N/A"}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.examId?.date || "N/A"}
                      </div>
                    </td>

                    {/* MCQ Marks */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {item.mcqMarks} Marks
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Correct:{" "}
                        <span className="text-emerald-600 font-medium">
                          {item.mcqCorrect}
                        </span>{" "}
                        | Wrong:{" "}
                        <span className="text-rose-600 font-medium">
                          {item.mcqIncorrect}
                        </span>
                      </div>
                    </td>

                    {/* Written Marks */}
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {item.writtenMarks}
                    </td>

                    {/* Total & Percentage */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {item.totalObtainedMarks}{" "}
                        <span className="text-slate-400 font-normal">
                          / {item.fullMarks}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-blue-600 mt-0.5">
                        {item.percentage}%
                      </div>
                    </td>

                    {/* Merit Position */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600">
                        <Award className="w-4 h-4" />
                        <span>#{item.meritPosition || "-"}</span>
                      </div>
                    </td>

                    {/* Remarks */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          item.remarks === "Excellent"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.remarks === "Good"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.remarks}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PAGINATION FOOTER --- */}
        {limit !== "all" && data?.meta && data.meta.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Showing Page{" "}
              <span className="font-bold text-slate-700">{data.meta.page}</span>{" "}
              of{" "}
              <span className="font-bold text-slate-700">
                {data.meta.totalPages}
              </span>{" "}
              (Total Records: {data.meta.total})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, data.meta.totalPages))
                }
                disabled={page === data.meta.totalPages}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
