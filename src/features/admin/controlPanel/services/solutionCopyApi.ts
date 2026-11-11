import { baseApi } from "@/api/baseApi";

// 1. Define your data and response interfaces
export interface ISolutionCopy {
  id: string;
  title?: string;
  // Add other relevant properties matching your backend schema
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
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: T[];
}

export interface IDeleteResponse {
  success: boolean;
  message: string;
}

// 2. Inject endpoints into baseApi
export const solutionCopyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Delete solution copy mutation
    deleteSolutionCopy: builder.mutation<IDeleteResponse, string>({
      query: (id) => ({
        url: `/solutionCopy/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SolutionCopy"],
    }),

    // Get all solution copies query with pagination
    getAllSolutionCopy: builder.query<
      IPaginatedResponse<ISolutionCopy>,
      IPaginationParams
    >({
      query: (params) => ({
        url: `/solutionCopy/all`,
        method: "GET",
        params, // RTK Query automatically handles query parameters safely here
      }),
      providesTags: ["SolutionCopy"],
    }),
  }),
});

// 3. Export hooks for usage in functional components
export const { useDeleteSolutionCopyMutation, useGetAllSolutionCopyQuery } =
  solutionCopyApi;
