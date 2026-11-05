import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseApi } from '../../../../redux/features/baseApi';

// Define a service using a base URL and expected endpoints
export const meritApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveMeritData: builder.mutation({
      query: (body) => ({
        url: 'merit-list/save',
        method: 'POST',
        body,
      }),
      // Invalidate the exam list if you have a query for it later
      invalidatesTags: ['MeritExam'],
    }),

    // get combined merit list(merit-1,merit-2, merit-3)
    getCombinedMeritList: builder.query({
      query: ({ departmentId, session, page, limit, search }) => {
        return {
          url: 'merit-list/combined',
          method: 'GET',
          params: {
            departmentId: departmentId.toUpperCase().trim(),
            session: session.trim(),
            page,
            limit,
            search,
          },
        };
      },

      providesTags: (result, error, { departmentId, session }) => [
        { type: 'CombinedMerit', id: `${departmentId}_${session}` },
      ],

      keepUnusedDataFor: 300,
    }),

    // get student merit list (only a student)
    getStudentExamResult: builder.query({
      query: () => `merit-list/my-exams`,
      providesTags: ['MeritList'],
    }),

    // get all merit list
    getMeritRecords: builder.query({
      query: ({ search, page, limit, model, examDate, session }) => {
        return {
          url: `merit-list/all`,
          method: 'GET',
          params: {
            search,
            page,
            limit,
            model,
            examDate,
            session,
          },
        };
      },

      providesTags: [{ type: 'MeritList', id: 'LIST' }],
    }),

    // delete merit list by id
    deleteMeritRecords: builder.mutation({
      query: (ids) => ({
        url: `merit-list/batch-delete`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'MeritList', id: 'LIST' }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useSaveMeritDataMutation,
  useGetCombinedMeritListQuery,
  useGetStudentExamResultQuery,
  useDeleteMeritRecordsMutation,
  useGetMeritRecordsQuery,
} = meritApi;
