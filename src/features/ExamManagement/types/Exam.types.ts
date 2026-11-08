import { UseFormReturn } from "react-hook-form";

export type ExamStatus = "draft" | "published";

export type ExamType = "written" | "mcq" | "combined";

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
  status: string;
  fullMarks: number;
  examType: ExamType;
  mcqFullMarks: number;
  writtenFullMarks: number;
}

export interface ExamRecord extends ExamFormValues {
  _id: string;
  id: string;
  status: ExamStatus;
  batchId?: string | null | undefined;
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

export type ExamSubmitHandler = (
  data: ExamFormValues,
  editingExamId: string | null,
) => void | Promise<void>;

export interface UseExamFormReturn {
  form: UseFormReturn<ExamFormValues, any>; // এখানে Type Argument ঠিক করা হয়েছে
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

export type MarkRow = {
  id: string;
  roll: string;
  name: string;
  mcq: number;
  written: number;
};

export type SidePanel = {
  type: "edit" | "marks" | "results";
  id: string;
} | null;
