import { baseApi } from '../baseApi';

const resultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postResult: builder.mutation({
      query: (data) => ({
        url: 'admin/result/upload-result',
        method: 'POST',
        body: data,
      }),
    }),

    getAllResults: builder.query({
      query: ({ page, limit }) => ({
        url: `admin/result/all?page=${page}&limit=${limit}`,
      }), // Adjust the URL path as necessary
    }),

    deleteResult: builder.mutation({
      query: (id) => ({
        url: `admin/result/delete/${id}`,
        method: 'DELETE',
      }), // Adjust the URL path as necessary
    }),
  }),
});

export const {
  usePostResultMutation,
  useGetAllResultsQuery,
  useDeleteResultMutation,
} = resultApi;
