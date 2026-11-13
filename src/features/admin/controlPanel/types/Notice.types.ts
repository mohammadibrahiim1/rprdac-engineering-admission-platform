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
  notices: Notice[];
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

export interface NoticeAuthor {
  _id?: string;
  name?: string;
  role?: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  author?: NoticeAuthor;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NoticeFormData {
  title: string;
  content: string;
  tags: string[];
  authorId?: string;
  authorName?: string;
  authorRole?: string;
}

export interface NoticesResponse {
  notices: Notice[];
  totalItems: number;
  page?: number;
  limit?: number;
}

export type ViewMode = "inbox" | "view" | "add" | "edit";

export interface NoticeFiltersState {
  searchTerm?: string;
  selectedDate?: string;
  selectedAuthor?: string;
}
