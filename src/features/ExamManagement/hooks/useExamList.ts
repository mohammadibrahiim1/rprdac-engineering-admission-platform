import { useState, useMemo } from "react";
import type { ExamRecord, ExamStatus } from "../types/ExamManagement.types";
import { useGetExamsQuery } from "../services/examApi";

export function useExamList() {
  const [examDateFilter, setExamDateFilter] = useState<string>("");

  const { data: response, isLoading, error } = useGetExamsQuery();

  const exams: ExamRecord[] = response?.data || [];

  console.log("exams", exams);

  // const handleDeleteExam = (exam: ExamRecord): void => {
  //   setExams((prev) => prev.filter((item) => item.id !== exam.id));
  // };

  // const handleStatus = (exam: ExamRecord): void => {
  //   const nextStatus: ExamStatus =
  //     exam.status === "published" ? "draft" : "published";

  //   setExams((prev) =>
  //     prev.map((item) =>
  //       item.id === exam.id ? { ...item, status: nextStatus } : item,
  //     ),
  //   );
  // };

  // const upsertExam = (normalizedData: any, editingExamId: string | null) => {
  //   if (editingExamId) {
  //     setExams((prev) =>
  //       prev.map((exam) =>
  //         exam.id === editingExamId ? { ...exam, ...normalizedData } : exam,
  //       ),
  //     );
  //   } else {
  //     const newExam: ExamRecord = {
  //       ...normalizedData,
  //       id: crypto.randomUUID(),
  //       status: "draft",
  //     };
  //     setExams((prev) => [newExam, ...prev]);
  //   }
  // };

  const filteredExams = useMemo(() => {
    if (!examDateFilter) return exams;
    return exams?.filter((exam) => exam.date === examDateFilter);
  }, [exams, examDateFilter]);

  return {
    filteredExams,
    allExamsCount: exams?.length,
    examDateFilter,
    setExamDateFilter,
    // handleDeleteExam,
    // handleStatus,
    // upsertExam,
    isLoading,
    error,
  };
}
