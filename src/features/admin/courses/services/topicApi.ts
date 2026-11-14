import {
  CreateTopicInput,
  ITopic,
  UpdateTopicInput,
} from "../types/course.types";
import { baseApi } from "@/api/baseApi";

export const topicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopics: builder.query<
      { success: boolean; data: ITopic[] },
      { courseId?: string } | void
    >({
      query: (params) => ({
        url: "/topics/all",
        params: params || {},
      }),
      providesTags: ["Topic"],
    }),
    createTopic: builder.mutation<
      { success: boolean; data: ITopic; message: string },
      CreateTopicInput
    >({
      query: (body) => ({
        url: "/topics/post",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Topic"],
    }),
    updateTopic: builder.mutation<
      { success: boolean; data: ITopic; message: string },
      { id: string; body: UpdateTopicInput }
    >({
      query: ({ id, body }) => ({
        url: `/topics/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Topic"],
    }),
    deleteTopic: builder.mutation<
      { success: boolean; message: string },
      { id?: string; ids?: string[] }
    >({
      query: ({ id, ids }) => ({
        url: id ? `/topics/${id}` : "/topics",
        method: "DELETE",
        body: ids ? { ids } : undefined,
      }),
      invalidatesTags: ["Topic"],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicApi;
