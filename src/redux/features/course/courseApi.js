import { baseApi } from '../baseApi';

const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // postStudent: builder.mutation({
    //   query: (data) => ({
    //     url: "/admin/student/create",
    //     method: "POST",
    //     body: data,
    //   }),
    // }),

    getCourse: builder.query({
      query: (targetId) => ({
        url: `/course/teacher/class/${targetId}`,
      }),
    }),

    // getLoan: builder.query({
    //   query: ({ loanId }) => ({
    //     url: `/loan/${loanId}`,
    //   }),
    // }),
  }),
});

export const { useGetCourseQuery, useGetLoanQuery } = courseApi;
