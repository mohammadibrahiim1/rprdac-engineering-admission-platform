import { baseApi } from "@/api/baseApi";
import {
  IBillingRatesResponse,
  ICreateBillingRatePayload,
  IDeleteBillingRateArgs,
  IGetBillingRatesQueryParams,
  IStandardResponse,
  IUpdateBillingRatePayload,
} from "../types/BillingRate.types";

// Inject the Billing Rate endpoints into baseApi
export const billingRateEndpoints = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Fetch all billing rates with optional query parameters
    getBillingRates: builder.query<
      IBillingRatesResponse,
      IGetBillingRatesQueryParams
    >({
      query: (params) => ({
        url: "billing/all",
        method: "GET",
        params,
      }),
      providesTags: ["BillingRates", { type: "BillingRates", id: "LIST" }],
    }),

    // POST: Create a new billing rate
    createBillingRate: builder.mutation<
      IStandardResponse,
      ICreateBillingRatePayload
    >({
      query: (payload) => ({
        url: "billing/bill/post",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["BillingRates", { type: "BillingRates", id: "LIST" }],
    }),

    // PATCH: Update an existing billing rate
    updateBillingRate: builder.mutation<
      IStandardResponse,
      IUpdateBillingRatePayload
    >({
      query: ({ id, ...rest }) => ({
        url: `/billing/up-rates/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["BillingRates", { type: "BillingRates", id: "LIST" }],
    }),

    // DELETE: Remove a rate or sub-rate
    deleteBillingRate: builder.mutation<
      IStandardResponse,
      IDeleteBillingRateArgs
    >({
      query: ({ billingRateId, rateId }) => {
        let url = `billing/${billingRateId}`;
        if (rateId) {
          url += `?rateId=${rateId}`;
        }
        return {
          url,
          method: "DELETE",
        };
      },
      invalidatesTags: ["BillingRates", { type: "BillingRates", id: "LIST" }],
    }),
  }),
});

// Export hooks for use in functional components
export const {
  useGetBillingRatesQuery,
  useCreateBillingRateMutation,
  useUpdateBillingRateMutation,
  useDeleteBillingRateMutation,
} = billingRateEndpoints;
