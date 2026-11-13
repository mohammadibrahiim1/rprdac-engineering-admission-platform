import { baseApi } from '../baseApi';

export const visitorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVisitCount: builder.query({
      query: () => '/visitor/all',
    }),

    incrementVisitCount: builder.mutation({
      query: (sessionId) => ({
        url: '/visitor/post',
        method: 'POST',
        body: {
          sessionId,
        },
      }),
    }),
  }),
});

export const { useGetVisitCountQuery, useIncrementVisitCountMutation } =
  visitorApi;
