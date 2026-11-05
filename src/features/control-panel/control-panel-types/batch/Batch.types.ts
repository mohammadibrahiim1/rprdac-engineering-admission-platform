export interface BatchRecord {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatchRequest {
  name: string;
  [key: string]: any; // আপনার প্রয়োজন অনুযায়ী অতিরিক্ত ফিল্ড যুক্ত করতে পারেন
}

export interface DeleteBatchRequest {
  id?: string;
  ids?: string[];
}
