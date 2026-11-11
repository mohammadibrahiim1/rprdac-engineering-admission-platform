import { baseApi } from "@/api/baseApi";
import {
  IPaginatedResponse,
  IPaginationParams,
  IResult,
  IStandardResponse,
} from "../types/Result.types";

export const resultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Post/Upload result mutation (supports FormData or JSON payloads)
    postResult: builder.mutation<
      IStandardResponse,
      FormData | Record<string, any>
    >({
      query: (data) => ({
        url: "admin/result/upload-result",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Result"],
    }),

    // Get all results query with pagination and automatic cache tagging
    getAllResults: builder.query<
      IPaginatedResponse<IResult>,
      IPaginationParams
    >({
      query: (params) => ({
        url: "admin/result/all",
        method: "GET",
        params, // RTK Query cleanly serializes and attaches query parameters here
      }),
      providesTags: ["Result"],
    }),

    // Delete result mutation by ID
    deleteResult: builder.mutation<IStandardResponse, string>({
      query: (id) => ({
        url: `admin/result/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Result"],
    }),
  }),
});

export const {
  usePostResultMutation,
  useGetAllResultsQuery,
  useDeleteResultMutation,
} = resultApi;
