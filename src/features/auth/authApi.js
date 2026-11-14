import { baseApi } from "@/api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
        headers: {
          "Content-type": "application/json",
        },
      }),
    }),

    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    fetchUser: builder.query({
      query: () => "/user/all",
    }),

    staffAdmissionLogin: builder.mutation({
      query: (credentials) => ({
        url: `/auth/admission-login`,
        method: "POST",
        body: credentials,
      }),
    }),

    getAdmission: builder.query({
      query: () => ({
        url: ` /auth/admission`,
        method: "GET",
        headers: {
          authorization: ` Bearer${localStorage.getItem("token")}`,
        },
      }),
    }),

    // create staff account
    createStaffAccount: builder.mutation({
      query: (formData) => {
        return {
          url: `/user/create-staff`,
          method: "POST",
          body: formData,
        };
      },

      invalidatesTags: ["AdmissionStaff"],
    }),

    // student login
    loginStudent: builder.mutation({
      query: (credentials) => ({
        url: "/auth/student/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const {
  usePostUserMutation,
  useFetchUserQuery,
  useLoginUserMutation,
  useStaffAdmissionLoginMutation,
  useCreateStaffAccountMutation,
  useUpdateAdmissionStaffAccountMutation,
  useLoginStudentMutation,
} = authApi;
