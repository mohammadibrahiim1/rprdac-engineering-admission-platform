import { baseApi } from '../baseApi';

export const academicInfoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🟢 POST Academic Info
    addAcademicInfo: builder.mutation({
      query: (data) => ({
        url: 'academic/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicInfo'], // optional
    }),

    // 🟢 (Optional) GET Academic Info
    getAcademicInfos: builder.query({
      query: () => 'academic/all',
      providesTags: ['AcademicInfo'],
    }),

    //update academic info
    updateAcademicInfo: builder.mutation({
      query: ({ id, path, items }) => ({
        url: `/academic/update/${id}`,
        method: 'PATCH',
        body: { path, items },
      }),
      invalidatesTags: ['Academic'],
    }),
    //DELETE Academic Info
    deleteAcademicInfo: builder.mutation({
      query: (ids) => ({
        url: `/academic/delete/items`,
        method: 'DELETE',
        body: { ids },
      }),
      // Invalidate the cache to refetch academic info

      invalidatesTags: ['AcademicInfo'],
    }),
  }),
});

export const {
  useAddAcademicInfoMutation,
  useGetAcademicInfosQuery,
  useUpdateAcademicInfoMutation,
  useDeleteAcademicInfoMutation,
} = academicInfoApi;
