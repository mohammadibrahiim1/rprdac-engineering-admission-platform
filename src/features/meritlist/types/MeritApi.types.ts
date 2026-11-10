import { MeritRecord, MeritRegistryResponse } from "./Merit.types";

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
