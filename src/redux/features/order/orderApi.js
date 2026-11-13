import { baseApi } from '../baseApi';

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ page = 1, limit = 10, status = '', searchQuery = '' }) => ({
        url: '/order/all',
        params: { page, limit, status, searchQuery },
      }),
      providesTags: ['Orders'],
    }),

    getOrdersWithUserPhone: builder.query({
      query: ({ phoneNumber, page, limit }) => ({
        url: `/order/client?phone=${phoneNumber}&page=${page}&limit=${limit}`,
      }),
      providesTags: ['Orders'],
    }),

    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/order/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrdersWithUserPhoneQuery,
  useDeleteOrderMutation,
} = orderApi;
