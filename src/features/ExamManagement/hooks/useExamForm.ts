import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";

import type {
  ExamBatch,
  ExamFormValues,
  ExamRecord,
  UseExamFormReturn,
  ExamType,
} from "../types/Exam.types";

import { useGetBatchesQuery } from "@/features/control-panel/control-panel-services/batch/batchApi";

import {
  getCurrentSession,
  getLocalDate,
  getSessionOptions,
} from "@/utils/session";
import {
  useCreateExamMutation,
  useUpdateExamMutation,
} from "../services/examApi";

const getDefaultExamValues = (): ExamFormValues => ({
  title: "",
  subject: "",
  batchIds: [],
  date: getLocalDate(),
  status: "",
  session: getCurrentSession(),
  fullMarks: 100,
  examType: "written",
  mcqFullMarks: 0,
  writtenFullMarks: 0,
});

export function useExamForm(): UseExamFormReturn {
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examStructureLocked, setExamStructureLocked] =
    useState<boolean>(false);
  const [examBatchSearch, setExamBatchSearch] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  // RTK Query Mutations
  const [createExam] = useCreateExamMutation();
  const [updateExam] = useUpdateExamMutation();

  const sessionOptions = useMemo<string[]>(() => getSessionOptions(), []);

  const { data: batches = [], isLoading: isBatchLoading } =
    useGetBatchesQuery(examBatchSearch);

  const form = useForm<ExamFormValues>({
    defaultValues: getDefaultExamValues(),
    mode: "onSubmit",
  });

  const { watch, setValue, reset } = form;

  const examType = watch("examType");
  const fullMarks = watch("fullMarks") ?? 100;
  const mcqFullMarks = watch("mcqFullMarks") ?? 0;
  const writtenFullMarksInput = watch("writtenFullMarks") ?? 0;
  const batchIds = watch("batchIds") ?? [];

  const isStructureLocked = examStructureLocked && Boolean(editingExamId);

  const isAllSelected =
    batchIds.includes("all") ||
    (batches.length > 0 &&
      batches.every((batch: ExamBatch) => batchIds.includes(batch._id)));

  const filteredBatches = useMemo(() => {
    const search = examBatchSearch.trim().toLowerCase();
    if (!search) return batches;
    return batches.filter((batch: ExamBatch) =>
      batch.title.toLowerCase().includes(search),
    );
  }, [batches, examBatchSearch]);

  const getBatchNames = useCallback(
    (ids: string[]): string => {
      if (ids.includes("all")) {
        return "All Batches Selected";
      }
      const names = ids
        .map(
          (id) => batches.find((batch: ExamBatch) => batch._id === id)?.title,
        )
        .filter((name): name is string => Boolean(name));

      return names.length ? names.join(", ") : "No batch selected";
    },
    [batches],
  );

  const handleBatchCheckboxChange = useCallback(
    (batchId: string, checked: boolean | string) => {
      const isChecked = checked === true;
      const updated = isChecked
        ? [...batchIds.filter((id) => id !== "all"), batchId]
        : batchIds.filter((id) => id !== "all" && id !== batchId);

      setValue("batchIds", [...new Set(updated)], {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [batchIds, setValue],
  );

  const selectAllBatches = useCallback(() => {
    setValue("batchIds", ["all"], { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  const clearAllBatches = useCallback(() => {
    setValue("batchIds", [], { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  // ----------------------------------
  // Fixed Marks Calculation Logic
  // ----------------------------------
  const calculatedWrittenMarks = useMemo(
    () => Math.max(0, fullMarks - mcqFullMarks),
    [fullMarks, mcqFullMarks],
  );

  const calculatedMcqMarks = useMemo(
    () => Math.max(0, fullMarks - writtenFullMarksInput),
    [fullMarks, writtenFullMarksInput],
  );

  const finalMcqMarks = useMemo(() => {
    if (examType === "written") return calculatedMcqMarks;
    if (examType === "mcq") return mcqFullMarks;
    return mcqFullMarks;
  }, [examType, calculatedMcqMarks, mcqFullMarks]);

  const finalWrittenMarks = useMemo(() => {
    if (examType === "mcq") return calculatedWrittenMarks;
    if (examType === "written") return writtenFullMarksInput;
    return writtenFullMarksInput;
  }, [examType, calculatedWrittenMarks, writtenFullMarksInput]);

  // Exam Type Change Handler
  const handleExamTypeChange = (
    type: string,
    onChange: (val: string) => void,
  ) => {
    onChange(type);

    if (type === "mcq") {
      // MCQ active, Written disabled & calculated
      setValue("mcqFullMarks", fullMarks, { shouldDirty: true });
      setValue("writtenFullMarks", 0, { shouldDirty: true });
    } else if (type === "written") {
      // Written active, MCQ disabled & calculated
      setValue("writtenFullMarks", fullMarks, { shouldDirty: true });
      setValue("mcqFullMarks", 0, { shouldDirty: true });
    } else if (type === "combined") {
      // Both active (50/50 split)
      const half = Math.floor(fullMarks / 2);
      setValue("mcqFullMarks", half, { shouldDirty: true });
      setValue("writtenFullMarks", fullMarks - half, { shouldDirty: true });
    }
  };

  const cancelEdit = useCallback(() => {
    setEditingExamId(null);
    setExamStructureLocked(false);
    reset(getDefaultExamValues());
  }, [reset]);

  const resetForm = useCallback(() => {
    setEditingExamId(null);
    setExamStructureLocked(false);
    reset(getDefaultExamValues());
  }, [reset]);

  const startEditing = useCallback(
    (exam: ExamRecord) => {
      setEditingExamId(exam.id || exam._id); // _id বা id সাপোর্ট করার জন্য
      setExamStructureLocked(true);

      const activeBatchIds =
        exam.batchIds?.length > 0
          ? exam.batchIds
          : exam.batchId
            ? [exam.batchId]
            : [];

      reset({
        title: exam.title,
        subject: exam.subject,
        batchIds: activeBatchIds,
        date: exam.date.slice(0, 10),
        session: exam.session || getCurrentSession(),
        fullMarks: exam.fullMarks,
        examType: exam.examType,
        mcqFullMarks: exam.mcqFullMarks ?? 0,
        writtenFullMarks: exam.writtenFullMarks ?? 0,
      });
    },
    [reset],
  );

  // ----------------------------------
  // Separate Handlers with Real RTK Query API Calls
  // ----------------------------------

  const createExamHandler = async (submissionData: ExamFormValues) => {
    // RTK Query দিয়ে নতুন এক্সাম তৈরির রিয়েল API কল

    console.log("first", submissionData);
    await createExam(submissionData).unwrap();
  };

  const updateExamHandler = async (
    id: string,
    submissionData: ExamFormValues,
  ) => {
    // RTK Query দিয়ে এক্সাম আপডেট করার রিয়েল API কল (PATCH মেথড)
    await updateExam({ id, data: submissionData }).unwrap();
  };

  // ----------------------------------
  // Main Form Submission Handler
  // ----------------------------------
  const handleFormSubmit = useCallback(
    async (data: ExamFormValues): Promise<void> => {
      if (saving) return;

      try {
        setSaving(true);

        const submissionData: ExamFormValues = {
          ...data,
          title: data.title.trim(),
          subject: data.subject.trim(),
          session: data.session?.trim() || getCurrentSession(),
          mcqFullMarks: finalMcqMarks,
          writtenFullMarks: finalWrittenMarks ?? 0,
        };

        if (!submissionData.session) {
          throw new Error("Academic session is required.");
        }

        if (!submissionData.batchIds.length) {
          throw new Error("Please select at least one batch.");
        }

        if (
          submissionData.mcqFullMarks + submissionData.writtenFullMarks !==
          submissionData.fullMarks
        ) {
          throw new Error("MCQ and Written marks must equal total full marks.");
        }

        if (editingExamId) {
          // এডিট মোড হলে আপডেট API কল হবে
          await updateExamHandler(editingExamId, submissionData);
        } else {
          // ক্রিয়েট মোড হলে নতুন এক্সাম তৈরির API কল হবে
          console.log("data", submissionData);
          await createExamHandler(submissionData);
        }

        resetForm();
      } catch (error) {
        console.log("Exam submission failed:", error);
      } finally {
        setSaving(false);
      }
    },
    [
      saving,
      editingExamId,
      finalMcqMarks,
      finalWrittenMarks,
      resetForm,
      createExam,
      updateExam,
    ],
  );

  return {
    form,
    batches,
    filteredBatches,
    editingExamId,
    examStructureLocked,
    examBatchSearch,
    setExamBatchSearch,
    saving,
    setSaving,
    startEditing,
    cancelEdit,
    resetForm,
    isBatchLoading,
    examType,
    fullMarks,
    mcqFullMarks,
    writtenFullMarksInput,
    batchIds,
    isStructureLocked,
    isAllSelected,
    finalMcqMarks,
    finalWrittenMarks,
    calculatedMcqMarks,
    calculatedWrittenMarks,
    handleExamTypeChange,
    handleBatchCheckboxChange,
    selectAllBatches,
    clearAllBatches,
    getBatchNames,
    handleFormSubmit,
    sessionOptions,
  };
}
