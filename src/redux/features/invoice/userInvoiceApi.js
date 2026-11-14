import { baseApi } from "@/api/baseApi";

const userInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    deleteUserInvoice: builder.mutation({
      query: (id) => ({
        url: `invoice/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoice"],
    }),
  }),
});

export const { useDeleteUserInvoiceMutation } = userInvoiceApi;
