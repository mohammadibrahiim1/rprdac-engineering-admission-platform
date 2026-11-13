import { baseApi } from '../baseApi';

const nursingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postNursingAttendance: builder.mutation({
      query: (data) => ({
        url: '/nursing/create',
        method: 'POST',
        body: data,
      }),
    }),

    getNursingAllAttendance: builder.query({
      query: ({ nursingId, page = 1, limit = 10 }) => ({
        url: `nursing/attendance/${nursingId}?page=${page}&limit=${limit}`,
        transformResponse: (response) => {
          return {
            data: response?.data,
            page: response?.page,
            totalPages: response?.totalPages,
          };
        },
      }),
    }),

    getNursingLoanRequest: builder.query({
      query: (userId) => ({
        url: `nursing/${userId}/all-loan`,
      }),
    }),

    updateNursingAttendanceStatus: builder.mutation({
      query: ({ nursingId, status }) => ({
        url: `admin/update/status/${nursingId}`,
        method: 'PUT',
        body: { status },
      }),
    }),

    approvedAttendance: builder.mutation({
      query: ({ loanRequestId, status }) => ({
        url: `admin/approve-loan`,
        method: 'POST',
        body: { loanRequestId, status },
      }),
    }),

    getNursingSingleAttendanceById: builder.query({
      query: (id) => `/nursing/nursing-attendance/${id}`,
    }),

    getSingleNurseAttendances: builder.query({
      query: ({ nursingId, ...filters }) => ({
        url: `/nursing/single/${nursingId}/all-attendances`,
        params: {
          ...filters,
        },
      }),

      providesTags: ['NurseAttendances'],
    }),

    fetchNursingAllAttendance: builder.query({
      query: ({ phone, page = 1, limit = 10 }) => ({
        url: `nursing/allAttendance`,
        params: { phone, page, limit },
      }),
    }),

    fetchNurses: builder.query({
      query: ({ searchQuery, page, limit }) => ({
        url: '/nursing/allNurses',
        params: {
          searchQuery,
          page,
          limit,
        },
      }),
    }),

    fetchAllNursingLoans: builder.query({
      // /nursing/all-loan
      query: (phone) => ({
        url: `admin/nursing/all-loan`,
        params: { phone },
      }),
    }),

    // get all nursing duties summary
    getAllNursingDutiesSummary: builder.query({
      query: (params) => ({
        url: `nursing/all/duties/summary`,
        params,
      }),
    }),

    updateNursePayment: builder.mutation({
      query: ({ nursingId, payAmount, startDate, endDate, loanAmount }) => ({
        url: `/nursing/${nursingId}/update-payment`,
        method: 'POST',
        body: {
          payAmount,
          startDate,
          endDate,
          ...(loanAmount ? { loanAmount } : {}),
        },
      }),
    }),

    //get nursing approved duties
    getNursingApprovedDuties: builder.query({
      query: ({ page, limit, search }) => ({
        url: 'nursing/approved/all',
        params: {
          page,
          limit,
          search,
        },
      }),
    }),

    //get all nursing user
    getallNursingUser: builder.query({
      query: (params = {}) => ({
        url: 'user/nursing/all',
        params: {
          page: params.page || 1,
          limit: params.limit || 50, // Higher limit for search
          search: params.search || '',
          status: params.status || '',
          isActive: params.isActive || '',
          sortBy: params.sortBy || 'userName',
          sortOrder: params.sortOrder || 'asc',
        },
      }),
      // Only keep latest data to prevent cache buildup
      keepUnusedDataFor: 60, // 1 minute
      providesTags: ['Nursing'],
    }),

    // get nursing all duties
    getNursingAllDuties: builder.query({
      query: (params) => ({
        url: `/nursing/doc/nurse-duties/all`,
        params,
      }),
    }),

    // update nursing duty
    updateNursingDuty: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/nursing/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Nursing'],
    }),

    //DELETE
    deleteNursingDuty: builder.mutation({
      query: (ids) => ({
        url: `nursing/duty/delete`,
        method: 'DELETE',
        body: ids,
      }),
      invalidatesTags: [
        {
          type: 'Nursing',
          id: 'LIST',
        },
      ],
    }),

    //process nursing payment
    processNursingPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/nursing/process-payment', // Matches backend route
        method: 'POST',
        body: paymentData,
      }),
      // Invalidates tags to refresh lists after payment
      invalidatesTags: ['Nursing', 'Invoice'],
    }),
  }),
});

export const {
  usePostNursingAttendanceMutation,
  useGetNursingAllAttendanceQuery,
  useGetNursingSingleAttendanceByIdQuery,
  useUpdateNursingAttendanceStatusMutation,
  useFetchNursingAllAttendanceQuery,
  useFetchNursesQuery,
  useFetchAllNursingLoansQuery,
  useGetSingleNurseAttendancesQuery, // get single nurse attendance
  useGetAllNursingDutiesSummaryQuery, // get all nursing duties summary
  useUpdateNursePaymentMutation, //nursing payment update
  //get nursing approved duties
  useGetNursingApprovedDutiesQuery,
  useGetallNursingUserQuery,
  useGetNursingAllDutiesQuery,
  useUpdateNursingDutyMutation,
  useProcessNursingPaymentMutation,
  useDeleteNursingDutyMutation,
} = nursingApi;
