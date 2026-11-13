import { baseApi } from '../baseApi';

export const routineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get All Routines
    getRoutines: builder.query({
      query: ({ batch, startDate, endDate }) => ({
        url: '/routine/all',
        params: {
          batch,
          startDate,
          endDate,
        },
      }),
      providesTags: ['Routine'],
    }),

    // get student routines
    fetchStudentRoutines: builder.query({
      query: ({ batch, startDate, endDate }) => ({
        url: '/routine/student',
        params: {
          batch,
          startDate,
          endDate,
        },
      }),
      providesTags: ['Routine'],
      keepUnusedDataFor: 0,
    }),

    // 2. Add New Routine
    addRoutine: builder.mutation({
      query: (body) => ({
        url: '/routine/add', // Route: /api/v1/routines/add
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Routine'],
    }),

    // 3. Update Routine (Added)
    updateRoutine: builder.mutation({
      query: ({ id, data }) => ({
        url: `/routine/update/${id}`, // Route: /api/v1/routines/update/:id
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Routine'],
    }),

    // 4. Delete Routine
    deleteRoutine: builder.mutation({
      query: (ids) => ({
        url: `/routine/delete`, // Route: /api/v1/routines/delete/:id
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Routine'],
    }),

    duplicateRoutines: builder.mutation({
      query: ({ ids }) => ({
        url: '/routine/duplicate',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Routine'],
    }),
  }),
});

export const {
  useGetRoutinesQuery,
  useUpdateRoutineMutation,
  useDeleteRoutineMutation,
  useAddRoutineMutation,
  useDuplicateRoutinesMutation,
  useFetchStudentRoutinesQuery,
} = routineApi;
