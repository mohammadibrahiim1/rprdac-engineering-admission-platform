export interface ISolutionCopy {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  filePath?: string;
}

export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  message?: string;
  totalItems: number;
  data: T[];
}

export interface IDeleteResponse {
  success: boolean;
  message: string;
}
