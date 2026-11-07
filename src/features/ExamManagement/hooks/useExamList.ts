import { useState, useMemo } from "react";
import type { ExamRecord, ExamStatus } from "../types/ExamManagement.types";

export function useExamList() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [examDateFilter, setExamDateFilter] = useState<string>("");

  const handleDeleteExam = (exam: ExamRecord): void => {
    setExams((prev) => prev.filter((item) => item.id !== exam.id));
  };

  const handleStatus = (exam: ExamRecord): void => {
    const nextStatus: ExamStatus =
      exam.status === "published" ? "draft" : "published";

    setExams((prev) =>
      prev.map((item) =>
        item.id === exam.id ? { ...item, status: nextStatus } : item,
      ),
    );
  };

  const upsertExam = (normalizedData: any, editingExamId: string | null) => {
    if (editingExamId) {
      setExams((prev) =>
        prev.map((exam) =>
          exam.id === editingExamId ? { ...exam, ...normalizedData } : exam,
        ),
      );
    } else {
      const newExam: ExamRecord = {
        ...normalizedData,
        id: crypto.randomUUID(),
        status: "draft",
      };
      setExams((prev) => [newExam, ...prev]);
    }
  };

  const filteredExams = useMemo(() => {
    if (!examDateFilter) return exams;
    return exams.filter((exam) => exam.date.slice(0, 10) === examDateFilter);
  }, [exams, examDateFilter]);

  return {
    exams: filteredExams,
    allExamsCount: exams.length,
    examDateFilter,
    setExamDateFilter,
    handleDeleteExam,
    handleStatus,
    upsertExam,
  };
}
