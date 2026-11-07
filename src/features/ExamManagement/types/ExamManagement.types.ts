import { UseFormReturn } from "react-hook-form";

export type ExamStatus = "draft" | "published";

export type ExamType = "written" | "mcq" | "combined" | null;

export interface ExamBatch {
  _id: string;
  title: string;
}

export interface ExamFormValues {
  title: string;
  subject: string;
  batchIds: string[];
  date: string;
  session: string;
  fullMarks: number;
  examType: ExamType;
  mcqFullMarks: number;
  writtenFullMarks: number; // এখানে optional তুলে দিয়ে বাধ্যতামূলক করা হলো যাতে undefined না থাকে
}

export interface ExamRecord extends ExamFormValues {
  _id: string;
  id: string;
  status: ExamStatus;
  batchId?: string | null;
}

export interface ExamManagementState {
  exams: ExamRecord[];
  editingExamId: string | null;
  examStructureLocked: boolean;
  examBatchSearch: string;
  examDateFilter: string;
  saving: boolean;
}

export interface ExamManagementProps {
  batches: ExamBatch[];
}

// ExamSubmitHandler টাইপ ডিফিনিশন (ডুয়াল প্যারামিটার হ্যান্ডেল করার জন্য)
export type ExamSubmitHandler = (
  data: ExamFormValues,
  editingExamId: string | null,
) => void | Promise<void>;

export interface UseExamFormReturn {
  form: UseFormReturn<ExamFormValues>;
  batches: ExamBatch[];
  filteredBatches: ExamBatch[];
  editingExamId: string | null;
  examStructureLocked: boolean;
  examBatchSearch: string;
  setExamBatchSearch: (search: string) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  startEditing: (exam: ExamRecord) => void;
  cancelEdit: () => void;
  resetForm: () => void;
  isBatchLoading: boolean;
  examType: ExamType;
  fullMarks: number;
  mcqFullMarks: number;
  writtenFullMarksInput: number;
  batchIds: string[];
  isStructureLocked: boolean;
  isAllSelected: boolean;
  finalMcqMarks: number;
  finalWrittenMarks: number;
  calculatedMcqMarks: number;
  calculatedWrittenMarks: number;
  handleExamTypeChange: (
    value: string | null,
    onChange: (value: ExamType) => void,
  ) => void;
  handleBatchCheckboxChange: (
    batchId: string,
    checked: boolean | string,
  ) => void;
  selectAllBatches: () => void;
  clearAllBatches: () => void;
  getBatchNames: (ids: string[]) => string;
  sessionOptions: string[];
  handleFormSubmit: (data: ExamFormValues) => Promise<void>;
}
