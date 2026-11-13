import { baseApi } from '../baseApi';

const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postFAQ: builder.mutation({
      query: (faqData) => ({
        url: '/faq/upload',
        method: 'POST',
        body: faqData,
      }),
    }),

    getAllFAQs: builder.query({
      query: () => ({
        url: 'faq/all',
      }), // Adjust the URL path as necessary
    }),

    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/faq/delete/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  usePostFAQMutation,
  useGetAllFAQsQuery,
  useDeleteQuestionMutation,
} = faqApi;
