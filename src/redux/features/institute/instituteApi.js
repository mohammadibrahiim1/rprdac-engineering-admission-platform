import { baseApi } from '../baseApi';

const instituteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInstitute: builder.mutation({
      query: (data) => ({
        url: `institute/create`,
        method: 'POST',
        body: Array.isArray(data) ? data : [data],
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Institute'],
    }),

    //get institutes
    getInstitutes: builder.query({
      query: ({ page = 1, limit = 10, search }) => ({
        url: 'institute/all',
        method: 'GET',
        params: { page, limit, search },
      }),
      providesTags: ['Institute'],
    }),

    //delete institute
    deleteInstitutes: builder.mutation({
      query: (data) => {
        if (typeof data === 'string') {
          return {
            url: `institute/delete/${data}`,
            method: 'DELETE',
          };
        }
        //if data is an array, its multiple ids-use request body
        return {
          url: 'institute/delete',
          method: 'DELETE',
          body: data,
        };
      },
      invalidatesTags: ['Institute'],
    }),

    // Update institute
    updateInstitute: builder.mutation({
      query: ({ id, data }) => ({
        url: `institute/update/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Institute'],
    }),
  }),
});

export const {
  useCreateInstituteMutation,
  useGetInstitutesQuery,
  useDeleteInstitutesMutation,
  useUpdateInstituteMutation,
} = instituteApi;
