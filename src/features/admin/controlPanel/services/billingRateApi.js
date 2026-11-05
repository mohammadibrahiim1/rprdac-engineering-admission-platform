// store/billingRateApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseApi } from '../../../../../redux/features/baseApi';

// 2. Inject the Billing Rate endpoints
export const billingRateEndpoints = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingRates: builder.query({
      query: (params) => ({ url: 'billing/all', params }),
      providesTags: ['BillingRates'],
    }),

    // POST: Create a new billing rate
    createBillingRate: builder.mutation({
      query: (payload) => ({
        url: 'billing/bill/post',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'BillingRate', id: 'LIST' }],
    }),

    // PATCH: Update existing rate
    updateBillingRate: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/billing/up-rates/${id}`,
        method: 'PATCH',
        body: rest,
      }),

      invalidatesTags: [{ type: 'BillingRate', id: 'LIST' }],
    }),

    // DELETE: Remove a rate
    deleteBillingRate: builder.mutation({
      query: ({ billingRateId, rateId }) => {
        let url = `billing/${billingRateId}`;
        if (rateId) {
          url += `?rateId=${rateId}`;
        }
        return {
          url,
          method: 'DELETE',
        };
      },
      invalidatesTags: [{ type: 'BillingRate', id: 'LIST' }],
    }),
  }),
});

// 3. Export hooks for use in components
export const {
  useGetBillingRatesQuery,
  useCreateBillingRateMutation,
  useUpdateBillingRateMutation,
  useDeleteBillingRateMutation,
} = billingRateEndpoints;
