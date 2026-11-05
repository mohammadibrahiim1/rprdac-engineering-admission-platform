import { baseApi } from '../../../../../../redux/features/baseApi';

export const systemLockApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllSystemLocks: builder.query({
      query: () => '/system-lock/get',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'SystemLock',
                id: _id,
              })),
              { type: 'SystemLock', id: 'LIST' },
            ]
          : [{ type: 'SystemLock', id: 'LIST' }],
    }),

    getLockByPortal: builder.query({
      query: (portalType) => `/system-locks/portal/${portalType}`,
      providesTags: (result, error, portalType) => [
        { type: 'SystemLock', id: portalType },
      ],
    }),

    // create system lock
    createSystemLock: builder.mutation({
      query: (payload) => {
        return {
          url: '/system-lock/create',
          method: 'POST',
          body: payload,
        };
      },
      invalidatesTags: [{ type: 'SystemLock', id: 'LIST' }],
    }),

    updateSystemLock: builder.mutation({
      query: (payload) => ({
        url: `/system-lock/update`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'SystemLock', id: arg.targetId },
        { type: 'SystemLock', id: 'LIST' },
      ],
    }),

    deleteSystemLock: builder.mutation({
      query: (payload) => ({
        url: `/system-lock/delete`,
        method: 'DELETE',
        body: payload,
      }),
      // Invalidating tags forces getSystemLocks to re-fetch automatically
      invalidatesTags: (result, error, arg) => {
        if (error) return [];

        // If a whole document was dropped, invalidate the entire list view setup
        if (arg.actionType === 'DELETE_DOCUMENT') {
          return [
            { type: 'SystemLock', id: arg.targetId },
            { type: 'SystemLock', id: 'LIST' },
          ];
        }

        // For deleting individual sub-batches, re-fetch the list to accurately mirror structural mutations
        return [{ type: 'SystemLock', id: 'LIST' }];
      },
    }),
  }),
});

export const {
  useGetAllSystemLocksQuery,
  useGetLockByPortalQuery,
  useCreateSystemLockMutation,
  useUpdateSystemLockMutation,
  useDeleteSystemLockMutation,
} = systemLockApi;
