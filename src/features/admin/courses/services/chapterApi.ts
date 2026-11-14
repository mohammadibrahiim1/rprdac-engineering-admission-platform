import {
  IChapter,
  CreateChapterInput,
  UpdateChapterInput,
} from "../types/course.types";
import { baseApi } from "@/api/baseApi";

export const chapterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChapters: builder.query<
      { success: boolean; data: IChapter[] },
      { courseId?: string; topicId?: string } | void
    >({
      query: (params) => ({
        url: "/chapters/all",
        params: params || {},
      }),
      providesTags: ["Chapter"],
    }),
    createChapter: builder.mutation<
      { success: boolean; data: IChapter; message: string },
      CreateChapterInput
    >({
      query: (body) => ({
        url: "/chapters/post",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chapter"],
    }),
    updateChapter: builder.mutation<
      { success: boolean; data: IChapter; message: string },
      { id: string; body: UpdateChapterInput }
    >({
      query: ({ id, body }) => ({
        url: `/chapters/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Chapter"],
    }),
    deleteChapter: builder.mutation<
      { success: boolean; message: string },
      { id?: string; ids?: string[] }
    >({
      query: ({ id, ids }) => ({
        url: id ? `/chapters/${id}` : "/chapters",
        method: "DELETE",
        body: ids ? { ids } : undefined,
      }),
      invalidatesTags: ["Chapter"],
    }),
  }),
});

export const {
  useGetChaptersQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chapterApi;
