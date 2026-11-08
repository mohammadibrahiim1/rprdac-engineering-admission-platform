import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ExamBatch,
  ExamFormValues,
  ExamRecord,
  ExamStatus,
} from "../types/Exam.types";

const getDefaultExamValues = (): ExamFormValues => ({
  title: "",
  subject: "",
  batchIds: [],
  date: new Date().toISOString().slice(0, 10),
  session: "",
  status: "",
  fullMarks: 100,
  examType: "written",
  mcqFullMarks: 0,
  writtenFullMarks: 0,
});

export function useExamManagement(batches: ExamBatch[]) {
  const [exams, setExams] = useState<ExamRecord[]>([]);

  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  const [examStructureLocked, setExamStructureLocked] =
    useState<boolean>(false);

  const [examBatchSearch, setExamBatchSearch] = useState<string>("");

  const [examDateFilter, setExamDateFilter] = useState<string>("");

  const [saving, setSaving] = useState<boolean>(false);

  const form = useForm<ExamFormValues>({
    defaultValues: getDefaultExamValues(),
    mode: "onSubmit",
  });

  const cancelEdit = () => {
    setEditingExamId(null);
    setExamStructureLocked(false);
    form.reset(getDefaultExamValues());
  };

  const onSubmit = async (data: ExamFormValues): Promise<void> => {
    if (saving) return;

    setSaving(true);

    try {
      const normalizedData: ExamFormValues = {
        ...data,
        title: data.title.trim(),
        subject: data.subject.trim(),
        batchIds: [...new Set(data.batchIds)],
        fullMarks: Number(data.fullMarks),
        mcqFullMarks: Number(data.mcqFullMarks ?? 0),
      };

      if (editingExamId) {
        setExams((previousExams) =>
          previousExams?.map((exam) =>
            exam.id === editingExamId
              ? {
                  ...exam,
                  ...normalizedData,
                }
              : exam,
          ),
        );

        setEditingExamId(null);
      } else {
        const newExam: ExamRecord = {
          ...normalizedData,
          id: crypto.randomUUID(),
          status: "draft",
          _id: "",
        };

        setExams((previousExams) => [newExam, ...previousExams]);
      }

      setExamStructureLocked(false);
      form.reset(getDefaultExamValues());
    } finally {
      setSaving(false);
    }
  };

  const handleEditExam = (exam: ExamRecord): void => {
    setEditingExamId(exam.id);
    setExamStructureLocked(true);

    const batchIds =
      exam.batchIds.length > 0
        ? exam.batchIds
        : exam.batchId
          ? [exam.batchId]
          : [];

    form.reset({
      title: exam.title,
      subject: exam.subject,
      batchIds,
      date: exam.date.slice(0, 10),
      fullMarks: exam.fullMarks,
      examType: exam.examType,
      mcqFullMarks: exam.mcqFullMarks,
    });
  };

  const handleDeleteExam = (exam: ExamRecord): void => {
    setExams((previousExams) =>
      previousExams.filter((item) => item.id !== exam.id),
    );

    if (editingExamId === exam.id) {
      cancelEdit();
    }
  };

  const handleStatus = (exam: ExamRecord): void => {
    const nextStatus: ExamStatus =
      exam.status === "published" ? "draft" : "published";

    setExams((previousExams) =>
      previousExams.map((item) =>
        item.id === exam.id ? { ...item, status: nextStatus } : item,
      ),
    );
  };

  const filteredBatches = useMemo(() => {
    const search = examBatchSearch.trim().toLowerCase();

    if (!search) return batches;

    return batches.filter((batch) =>
      batch.title.toLowerCase().includes(search),
    );
  }, [batches, examBatchSearch]);

  const filteredExams = useMemo(() => {
    if (!examDateFilter) return exams;

    return exams.filter((exam) => exam.date.slice(0, 10) === examDateFilter);
  }, [exams, examDateFilter]);

  return {
    form,

    exams: filteredExams,
    allExamsCount: exams.length,

    batches: filteredBatches,

    editingExamId,
    examStructureLocked,

    examBatchSearch,
    setExamBatchSearch,

    examDateFilter,
    setExamDateFilter,

    saving,

    onSubmit,
    handleEditExam,
    handleDeleteExam,
    handleStatus,
    cancelEdit,
  };
}
