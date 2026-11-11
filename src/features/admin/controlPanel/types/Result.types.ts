export interface IResult {
  _id: string;
  title?: string;
  // Add any additional fields matching your backend result schema
  createdAt: string;
  updatedAt: string;
}

export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  message?: string;
  totalItems?: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: T[];
}

export interface IStandardResponse {
  success: boolean;
  message: string;
}
