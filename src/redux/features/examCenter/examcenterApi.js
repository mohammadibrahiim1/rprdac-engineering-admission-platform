import { baseApi } from '../baseApi';

export const examCenterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // create single admit card
    createSingleAdmitCard: builder.mutation({
      query: (formData) => ({
        url: '/single-admit-card/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['SingleAdmitCard'],
    }),

    // get green cards
    getSingleAdmitCard: builder.query({
      query: ({ academicYear, search, page, limit, startId, endId }) => ({
        url: '/single-admit-card/all',
        params: { academicYear, search, page, limit, startId, endId },
      }),
      providesTags: ['SingleAdmitCard'],
    }),

    // delete single admit card
    deleteSingleAdmitCard: builder.mutation({
      query: (data) => ({
        url: `/single-admit-card/delete`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['SingleAdmitCard'],
    }),

    // update single admit green card
    updateSingleAdmitGreenCard: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/single-admit-card/update/green-card/${id}`,
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: ['SingleAdmitCard'],
    }),
  }),
});

export const {
  useCreateSingleAdmitCardMutation,
  useGetSingleAdmitCardQuery,
  useDeleteSingleAdmitCardMutation,
  useUpdateSingleAdmitGreenCardMutation,
} = examCenterApi;
