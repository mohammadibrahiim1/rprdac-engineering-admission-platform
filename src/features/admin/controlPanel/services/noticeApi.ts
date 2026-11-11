import { baseApi } from "@/api/baseApi";
import {
  ICreateNoticePayload,
  IGetNoticesQueryParams,
  IPaginatedNoticeResponse,
  IStandardResponse,
  IUpdateNoticePayload,
} from "../types/Notice.types";

export const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST: Create a new notice
    postNotice: builder.mutation<
      IStandardResponse,
      ICreateNoticePayload | FormData
    >({
      query: (data) => ({
        url: "notice/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notice"],
    }),

    // GET: Fetch all notices with optional filters (page, limit, date)
    getAllNotices: builder.query<
      IPaginatedNoticeResponse,
      IGetNoticesQueryParams
    >({
      query: (params) => ({
        url: `notice/all`,
        method: "GET",
        params: {
          ...(params.page && { page: params.page }),
          ...(params.limit && { limit: params.limit }),
          ...(params.date && { date: params.date }),
        },
      }),
      providesTags: ["Notice"],
    }),

    // PATCH: Update an existing notice
    updateNotice: builder.mutation<IStandardResponse, IUpdateNoticePayload>({
      query: ({ id, ...data }) => ({
        url: `notice/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Notice"],
    }),

    // DELETE: Remove a notice by ID
    deleteNotice: builder.mutation<IStandardResponse, string>({
      query: (id) => ({
        url: `notice/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notice"],
    }),
  }),
});

export const {
  usePostNoticeMutation,
  useGetAllNoticesQuery,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} = noticeApi;
