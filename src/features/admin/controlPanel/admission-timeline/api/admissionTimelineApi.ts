import { baseApi } from "@/api/baseApi";
import {
  AdmissionTimelineResponse,
  SingleTimelineResponse,
  UpdateTimelinePayload,
} from "../hooks/useAdmissionTimelineContainer";
import { AdmissionTimelineItem } from "../timeline-types/Timeline.types";

export const admissionTimelineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionTimelines: builder.query<AdmissionTimelineResponse, void>({
      query: () => "/admission-timeline",
      providesTags: ["AdmissionTimeline"],
    }),

    getActiveAdmissionTimeline: builder.query<SingleTimelineResponse, void>({
      query: () => "/admission-timeline/active",
      providesTags: ["AdmissionTimeline"],
    }),

    createAdmissionTimeline: builder.mutation<
      SingleTimelineResponse,
      Partial<AdmissionTimelineItem>
    >({
      query: (body) => ({
        url: "/admission-timeline/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdmissionTimeline"],
    }),

    updateAdmissionTimeline: builder.mutation<
      SingleTimelineResponse,
      UpdateTimelinePayload
    >({
      query: ({ id, body }) => ({
        url: `/admission-timeline/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdmissionTimeline"],
    }),

    deleteAdmissionTimeline: builder.mutation<
      { success: boolean; message?: string },
      string[]
    >({
      query: (ids) => ({
        url: "/admission-timeline/delete",
        method: "DELETE",
        body: {
          ids,
        },
      }),
      invalidatesTags: ["AdmissionTimeline"],
    }),
  }),
});

export const {
  useGetAdmissionTimelinesQuery,
  useGetActiveAdmissionTimelineQuery,
  useCreateAdmissionTimelineMutation,
  useUpdateAdmissionTimelineMutation,
  useDeleteAdmissionTimelineMutation,
} = admissionTimelineApi;
