import { baseApi } from '../baseApi';

const loanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //mark loan paid
    markLoanPaid: builder.mutation({
      query: (loanId) => ({
        url: `/loan/${loanId}/mark-paid`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Loans'],
    }),

    //update loan data(active)
    updateLoanData: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/loan/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Loans'],
    }),

    // get loans by id or panel name dynamically(active)
    getLoans: builder.query({
      query: ({ userId, ...params }) => ({
        url: userId ? `loan/all-loan/${userId}` : 'loan/all-loan',
        method: 'GET',
        params: params, // panelType, status, page ইত্যাদি এখানে অটো সেট হবে
      }),
      providesTags: ['Loans'],
    }),

    //delete loan data (active)
    deleteLoan: builder.mutation({
      query: (data) => ({
        url: `loan/delete`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Loans'],
    }),
  }),
});

export const {
  useMarkLoanPaidMutation,
  useUpdateLoanDataMutation,
  useGetLoansQuery,
  useDeleteLoanMutation,
} = loanApi;
