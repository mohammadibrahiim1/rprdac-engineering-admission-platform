import { baseApi } from '../baseApi';

const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllLoans: builder.query({
      query: () => ({
        url: `admin/all-loan`,
      }),
    }),

    cancelLoan: builder.mutation({
      query: ({ loanRequestId }) => ({
        url: `loan/cancel/${loanRequestId}`,
        method: 'DELETE',
      }),
    }),

    // get all visitors
    getVisitors: builder.query({
      query: () => `/admin/visitors`,
    }),

    // get all pending loan request
    getAllLoanRequests: builder.query({
      query: (status) => ({
        url: `/admin/loans/all?status=${status || ''}`,
      }),
    }),

    // get all user invoices
    getUserInvoices: builder.query({
      query: () => ({
        url: '/admin/invoices/all',
      }),
    }),

    // get admission user
    getAdmissionUser: builder.query({
      query: (userType) => `/admin/admissionUser/${userType}`,
    }),

    getUsersPendingActivity: builder.query({
      query: (page, limit, phone) => ({
        url: `/user/data/pending/all`,
        params: { page, limit, phone },
      }),
    }),

    deleteSolutionCopy: builder.mutation({
      query: (id) => ({
        url: `/solutionCopy/delete/${id}`, // Ensure the endpoint matches your backend route
        method: 'DELETE', // Correcting any space issues in the method name
      }),
      invalidatesTags: ['Solution'],
    }),

    // Define the loan request endpoint(active for teacher)
    userRequestForLoan: builder.mutation({
      query: (loanData) => ({
        url: '/loan/request-loan', // Replace with your loan request endpoint
        method: 'POST',
        body: loanData,
      }),
    }),
  }),
});

export const {
  useGetAllLoansQuery,
  useCancelLoanMutation,
  useGetVisitorsQuery,
  useGetAllLoanRequestsQuery,
  useGetUserInvoicesQuery,
  useGetAdmissionUserQuery,
  useGetUsersPendingActivityQuery,
  useDeleteSolutionCopyMutation,
  // Export the auto-generated hook for the loan request mutation
  useUserRequestForLoanMutation,
} = adminApi;
