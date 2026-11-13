import { baseApi } from '../baseApi';

const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postNotice: builder.mutation({
      query: (data) => ({
        url: 'notice/create',
        method: 'POST',
        body: data,
      }),
    }),

    getAllNotices: builder.query({
      query: ({ page, limit, date }) => ({
        url: `notice/all`,
        params: {
          ...(page && { page }),
          ...(limit && { limit }),
          ...(date && { date }),
        },
      }), // Adjust the URL path as necessary
    }),

    //update notice data
    updateNotice: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `notice/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    // delete notice
    deleteNotice: builder.mutation({
      query: (id) => ({
        url: `notice/delete/${id}`,
        method: 'DELETE',
      }), // Adjust the URL path as necessary
    }),
  }),
});

export const {
  usePostNoticeMutation,
  useGetAllNoticesQuery,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} = noticeApi;
