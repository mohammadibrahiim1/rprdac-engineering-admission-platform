export interface DepartmentOption {
  value: string;
  label: string;
}

export interface SessionOption {
  value: string;
  label: string;
}

export interface CombinedMeritItem {
  slNo: number;
  rollNo: string;
  name: string;
  model1?: number;
  model2?: number;
  model3?: number;
  totalMarks?: number;
  rank: number | string;
}

export interface CombinedMeritMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

export interface CombinedMeritResponse {
  success: boolean;
  message?: string;
  data: CombinedMeritItem[];
  meta: CombinedMeritMeta;
}

export interface GetCombinedMeritQueryParams {
  departmentId: string;
  session: string;
  page: number;
  limit: string;
  search?: string;
}
