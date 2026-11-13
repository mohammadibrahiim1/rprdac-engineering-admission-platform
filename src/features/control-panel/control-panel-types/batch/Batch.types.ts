export interface BatchRecord {
  _id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateBatchRequest {
  name: string;
  [key: string]: any;
}

export interface DeleteBatchRequest {
  id?: string;
  ids?: string[];
}
