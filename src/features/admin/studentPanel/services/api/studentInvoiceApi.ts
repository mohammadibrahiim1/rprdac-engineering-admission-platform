import { baseApi } from "@/api/baseApi";

// Define interfaces for query parameters and data structures
export interface GetStudentsInvoicesParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number | string;
  status?: string;
}

export interface StudentInvoice {
  _id: string;
  studentId?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface StudentsInvoicesResponse {
  success?: boolean;
  data?: StudentInvoice[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number | string;
    totalPages?: number;
  };
  [key: string]: unknown;
}

export interface DeleteInvoicesRequest {
  ids: string[] | number[];
}

export interface DeleteInvoicesResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export const studentInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentsInvoices: builder.query<
      StudentsInvoicesResponse,
      GetStudentsInvoicesParams
    >({
      query: ({
        search = "",
        startDate = "",
        endDate = "",
        page = 1,
        limit = 10,
        status = "",
      }) => ({
        url: "students/invoices/all",
        params: { search, startDate, endDate, page, limit, status },
      }),
      // Fixed RTK Query typo: providingTags -> providesTags
      providesTags: ["StudentInvoices"],
    }),

    getStudentInvoiceByID: builder.query<
      StudentInvoice | StudentInvoice[],
      string | number
    >({
      query: (studentId) => {
        return `students/invoices/my-invoices/${studentId}`;
      },
      providesTags: ["StudentInvoices"],
    }),

    // Delete student invoices
    deleteStudentInvoices: builder.mutation<
      DeleteInvoicesResponse,
      string[] | number[] | DeleteInvoicesRequest
    >({
      query: (idsOrPayload) => {
        // Supports passing either an array directly or wrapped in an object { ids }
        const body = Array.isArray(idsOrPayload)
          ? { ids: idsOrPayload }
          : idsOrPayload;
        return {
          url: "students/invoices/delete",
          method: "DELETE",
          body,
        };
      },
      invalidatesTags: ["StudentInvoices"],
    }),
  }),
});

export const {
  useGetStudentsInvoicesQuery,
  useDeleteStudentInvoicesMutation,
  useGetStudentInvoiceByIDQuery,
} = studentInvoiceApi;
