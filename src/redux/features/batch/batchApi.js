import { baseApi } from '../baseApi';

const batchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBatch: builder.mutation({
      query: (batchesData) => ({
        url: 'batch/create',
        method: 'POST',
        body: batchesData,
      }),
      invalidatesTags: ['Batch'],
    }),

    // get batches
    getBatches: builder.query({
      query: (search) => ({
        url: `batch/all?search=${search}`,
      }),
      providesTags: ['Batch'],
    }),

    //delete batch
    deleteBatch: builder.mutation({
      query: ({ id, ids }) => ({
        url: id ? `batch/delete/${id}` : `batch/delete`,
        method: 'DELETE',
        body: ids ? { ids } : undefined,
      }),
      invalidatesTags: ['Batch'],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useDeleteBatchMutation,
} = batchApi;
