import { baseApi } from '../../../../../../redux/features/baseApi';

const studentInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentsInvoices: builder.query({
      query: ({
        search = '',
        startDate = '',
        endDate = '',
        page = 1,
        limit = 10,
        status = '',
      }) => ({
        url: 'students/invoices/all',
        params: { search, startDate, endDate, page, limit, status },
      }),
      providingTags: ['StudentInvoices'],
    }),

    getStudentInvoiceByID: builder.query({
      query: (studentId) => {
        return `students/invoices/my-invoices/${studentId}`;
      },
      providesTags: ['StudentInvoices'],
    }),

    //delete student invoices
    deleteStudentInvoices: builder.mutation({
      query: (ids) => ({
        url: `students/invoices/delete`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['StudentInvoices'],
    }),
  }),
});

export const {
  useGetStudentsInvoicesQuery,
  useDeleteStudentInvoicesMutation,
  useGetStudentInvoiceByIDQuery,
} = studentInvoiceApi;
