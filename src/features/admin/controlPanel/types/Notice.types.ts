export interface INotice {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface IGetNoticesQueryParams {
  page?: number | string;
  limit?: number | string;
  date?: string;
  [key: string]: any;
}

export interface IPaginatedNoticeResponse {
  success: boolean;
  message?: string;
  totalItems?: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: INotice[];
}

export interface ICreateNoticePayload {
  title: string;
  description?: string;
  [key: string]: any;
}

export interface IUpdateNoticePayload {
  id: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface IStandardResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}
