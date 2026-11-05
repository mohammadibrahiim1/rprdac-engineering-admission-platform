import { baseApi } from '../../../../../redux/features/baseApi';

const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShippingSettings: builder.query({
      query: () => '/shipping',
      providesTags: ['Shipping'],
    }),
    updateShippingSettings: builder.mutation({
      query: (body) => ({
        url: '/shipping/update',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Shipping'],
    }),

    createShipping: builder.mutation({
      query: (body) => ({
        url: '/shipping/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shipping'],
    }),

    deleteShipping: builder.mutation({
      query: (body) => ({
        url: '/shipping/delete',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Shipping'],
    }),
  }),
});

export const {
  useGetShippingSettingsQuery,
  useUpdateShippingSettingsMutation,
  useCreateShippingMutation,
  useDeleteShippingMutation,
} = shippingApi;
