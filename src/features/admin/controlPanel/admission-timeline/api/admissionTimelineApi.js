import { baseApi } from '../../../../../../redux/features/baseApi';

export const admissionTimelineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionTimelines: builder.query({
      query: () => '/admission-timeline',
      providesTags: ['AdmissionTimeline'],
    }),

    getActiveAdmissionTimeline: builder.query({
      query: () => '/admission-timeline/active',
      providesTags: ['AdmissionTimeline'],
    }),

    createAdmissionTimeline: builder.mutation({
      query: (body) => ({
        url: '/admission-timeline/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdmissionTimeline'],
    }),

    updateAdmissionTimeline: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admission-timeline/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdmissionTimeline'],
    }),

    deleteAdmissionTimeline: builder.mutation({
      query: (ids) => ({
        url: '/admission-timeline/delete',
        method: 'DELETE',
        body: {
          ids,
        },
      }),
      invalidatesTags: ['AdmissionTimeline'],
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
