import { baseApi } from "../baseApi";

// ==================== TypeScript Interfaces ====================

export interface Mess {
  _id: string;
  name?: string;
  address?: string;
  totalSeat?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface MessPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number | "all";
}

export interface GetMessesResponse {
  success?: boolean;
  message?: string;
  data?: {
    messes?: Mess[];
    pagination?: Partial<MessPagination>;
  };
}

export interface GetMessesQueryParams {
  search?: string;
  page?: number;
  limit?: number | "all";
}

export interface PostMessRequest {
  name: string;
  address?: string;
  totalSeat?: number;
  [key: string]: unknown;
}

export interface PostMessResponse {
  success?: boolean;
  message?: string;
  data?: Mess;
}

// ==================== API Slice ====================

const messApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ POST new mess with strict types
    postMess: builder.mutation<PostMessResponse, PostMessRequest>({
      query: (newMess) => ({
        url: "mess/create",
        method: "POST",
        body: newMess,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Mess"],
    }),

    // ✅ GET messes with pagination & search types
    getMesses: builder.query<GetMessesResponse, GetMessesQueryParams | void>({
      query: (params) => {
        const search = params?.search ?? "";
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 50;

        return `mess/all?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
      },
      providesTags: ["Mess"],
    }),
  }),
});

export const { usePostMessMutation, useGetMessesQuery } = messApi;
