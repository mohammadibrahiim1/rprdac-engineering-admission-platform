import { useMemo, useState, useCallback } from "react";
import type { ExamRecord, ExamStatus } from "../types/Exam.types";
import { useGetExamsQuery } from "../services/examApi";
import { useGetBatchesQuery } from "@/features/control-panel/control-panel-services/batch/batchApi";

export function useExamList() {
  // ── Filters ──────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [examDateFilter, setExamDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExamStatus | "">("");
  const [examBatchSearch, setExamBatchSearch] = useState("");

  // ── Data fetching ────────────────────────────────────────
  const { data: response, isLoading, error, refetch } = useGetExamsQuery();
  const { data: batches = [], isLoading: isBatchLoading } =
    useGetBatchesQuery(examBatchSearch);

  // Normalize API response → always have both `id` and `_id` + `batchIds`
  const exams: ExamRecord[] = useMemo(() => {
    const raw = response?.data ?? [];
    return raw.map((exam: any) => ({
      ...exam,
      id: exam.id ?? exam._id,
      _id: exam._id ?? exam.id,
      batchIds: Array.isArray(exam.batchIds)
        ? exam.batchIds
        : exam.batchId
          ? [exam.batchId]
          : [],
    }));
  }, [response?.data]);

  // ── Filtering ────────────────────────────────────────────
  const filteredExams = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return exams.filter((exam) => {
      // Date filter
      if (examDateFilter && exam.date !== examDateFilter) return false;

      // Status filter
      if (statusFilter && exam.status !== statusFilter) return false;

      // Text filter
      if (!needle) return true;

      const haystack = [exam.title, exam.subject, exam.session, exam.examType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [exams, examDateFilter, query, statusFilter]);

  // ── Derived counts ───────────────────────────────────────
  const publishedCount = useMemo(
    () => filteredExams.filter((e) => e.status === "published").length,
    [filteredExams],
  );

  const draftCount = filteredExams.length - publishedCount;

  const filtersActive =
    query.trim().length > 0 ||
    examDateFilter.length > 0 ||
    statusFilter.length > 0;

  // ── Helpers ──────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setQuery("");
    setExamDateFilter("");
    setStatusFilter("");
  }, []);

  const getBatchNames = useCallback(
    (batchIds: string[] | undefined | null): string => {
      if (!batchIds || batchIds.length === 0) return "All Batches";

      const names = batches
        .filter((b) => batchIds.includes(b._id))
        .map((b) => b.title);

      return names.length > 0 ? names.join(", ") : "—";
    },
    [batches],
  );

  // ── Public API ───────────────────────────────────────────
  return {
    // data
    exams,
    filteredExams,
    allExamsCount: exams.length,
    publishedCount,
    draftCount,
    batches,
    isLoading,
    isBatchLoading,
    error,
    refetch,

    // filters
    query,
    setQuery,
    examDateFilter,
    setExamDateFilter,
    statusFilter,
    setStatusFilter,
    examBatchSearch,
    setExamBatchSearch,
    filtersActive,
    clearFilters,

    // helpers
    getBatchNames,
  };
}
