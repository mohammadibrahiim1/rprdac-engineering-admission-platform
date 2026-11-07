import { baseApi } from "@/api/baseApi";
import {
  BatchRecord,
  CreateBatchRequest,
  DeleteBatchRequest,
} from "../../control-panel-types/batch/Batch.types";

const batchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Batch
    createBatch: builder.mutation<BatchRecord, CreateBatchRequest>({
      query: (batchesData) => ({
        url: "batch/create",
        method: "POST",
        body: batchesData,
      }),
      invalidatesTags: ["Batch"],
    }),

    // Get Batches
    getBatches: builder.query<BatchRecord[], string | void>({
      query: (search) => ({
        url: `batch/all`,
        params: search ? { q: encodeURIComponent(search) } : undefined,
      }),
      transformResponse: (response: {
        success: boolean;
        data: BatchRecord[];
      }) => response.data,
      providesTags: ["Batch"],
    }),

    // Delete Batch
    deleteBatch: builder.mutation<
      { success: boolean; message?: string },
      DeleteBatchRequest
    >({
      query: ({ id, ids }) => ({
        url: id ? `batch/delete/${id}` : "batch/delete",
        method: "DELETE",
        body: ids ? { ids } : undefined,
      }),
      invalidatesTags: ["Batch"],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useDeleteBatchMutation,
} = batchApi;
