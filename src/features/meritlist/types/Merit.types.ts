export interface ExamInfo {
  examDate?: string;
  departmentId?: string;
  session?: string;
  model?: string;
  totalMarks?: number | string;
}

export interface MeritRecordData {
  obtained__marks?: number | string;
  [key: string]: unknown;
}

export interface MeritRecord {
  _id: string;
  studentId: string;
  studentName: string;
  examInfo?: ExamInfo;
  data?: MeritRecordData;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number | string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MeritRegistryResponse {
  success: boolean;
  message?: string;
  data: MeritRecord[];
  pagination: PaginationMeta;
  meta: any;
}

export interface SessionOption {
  value: string;
  label: string;
}

export interface DeleteMeritResponse {
  success: boolean;
  message?: string;
}

// Query Parameter Interfaces
export interface GetCombinedMeritListParams {
  departmentId: string;
  session: string;
  page: number;
  limit: number | string;
  search?: string;
}

export interface GetMeritRecordsParams {
  search?: string;
  page: number;
  limit: number | string;
  model?: string;
  examDate?: string;
  session?: string;
}

// Mutation Payload & Response Interfaces
export interface SaveMeritDataPayload {
  [key: string]: unknown;
}

export interface SaveMeritDataResponse {
  success: boolean;
  message?: string;
  data?: MeritRecord;
}

export interface DeleteMeritRecordsPayload {
  ids: string[];
}

export interface DeleteMeritRecordsResponse {
  success: boolean;
  message?: string;
  deletedCount?: number;
}

export type StudentExamResultResponse = MeritRegistryResponse;
