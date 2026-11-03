export type ExamStatus = "draft" | "published";

export type ExamType = "written" | "mcq" | "combined";

export interface ExamBatch {
  id: string;
  name: string;
}

export interface ExamFormValues {
  title: string;
  subject: string;
  batchIds: string[];
  date: string;
  fullMarks: number;
  examType: ExamType;
  mcqFullMarks: number;
}

export interface ExamRecord extends ExamFormValues {
  id: string;
  status: ExamStatus;
  // Backward compatibility for older API records
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

export type ExamSubmitHandler = (data: ExamFormValues) => Promise<void>;
