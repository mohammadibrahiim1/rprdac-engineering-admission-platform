import { baseApi } from '../baseApi';

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postEmployeeAttendance: builder.mutation({
      query: (data) => ({
        url: `employee/create/duty`,
        method: 'POST',
        body: data,
      }),
    }),

    // employee statements
    fetchEmployeeDuties: builder.query({
      query: ({ employeeId, ...filters }) => ({
        url: `/employee/duties/${employeeId}/all`,
        params: {
          ...filters,
        },
      }),
      providesTags: ['EmployeeAttendances'],
    }),

    //fetch all employees
    fetchAllEmployees: builder.query({
      query: ({ searchQuery, page, limit }) => ({
        url: 'user/staff',
        params: { searchQuery, page, limit },
      }),
    }),

    //fetch all employee loans
    fetchAllEmployeesLoans: builder.query({
      query: (phone) => ({
        url: `admin/employee/all-loan`,
        params: { phone },
      }),
    }),

    // fetch employee duty by id
    fetchEmployeeDutyById: builder.query({
      query: (dutyId) => `/employee/duty/${dutyId}`,
    }),

    //update employee status
    updateEmployeeDutyStatus: builder.mutation({
      // /admin/duty/status
      query: ({ dutyId, status }) => ({
        url: `/admin/duty/status/${dutyId}`,
        method: 'PUT',
        body: { status },
      }),
    }),

    // get single employee user
    getSingleEmployee: builder.query({
      query: (_id) => ({
        url: `/user/${_id}`,
      }),
    }),

    //delete employee duty
    deleteEmployeeDuty: builder.mutation({
      query: (idsArray) => ({
        url: `employee/duty/delete`,
        method: 'DELETE',
        body: idsArray,
      }),
      invalidatesTags: ['EmployeeDuties'], // 🔥 auto refetch
    }),

    //update employee duty(active)
    updateEmployeeDuty: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `employee/update-duty/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['EmployeeDuties'],
    }),

    // Define a mutation to submit the payment
    payUserDue: builder.mutation({
      query: ({ userId, payAmount }) => ({
        url: `/admin/user/payment/${userId}`, // Your backend route
        method: 'PUT',
        body: { payAmount },
      }),
    }),

    // staff payment
    updateEmployeePayment: builder.mutation({
      query: ({ employeeId, payAmount, startDate, endDate, loanAmount }) => ({
        url: `/employee/${employeeId}/update-payment`,
        method: 'PUT',
        body: {
          payAmount,
          startDate,
          endDate,
          ...(loanAmount ? { loanAmount } : {}),
        },
      }),
    }),

    getAllEmployeeDutiesWithSummary: builder.query({
      query: (params) => ({
        url: `employee/all/duties/summary`,
        params,
      }),
    }),

    getEmployeeApprovedDuties: builder.query({
      query: ({ page, limit, search }) => ({
        url: 'employee/approved/all',
        params: {
          page,
          limit,
          search,
        },
      }),
    }),

    getEmployeeAllDuties: builder.query({
      query: (params) => ({
        url: `employee/duty/adm/all`,
        params,
      }),
      providesTags: ['EmployeeDuties'],
    }),

    //process employee payment(active)
    processEmployeePayment: builder.mutation({
      query: (payload) => ({
        url: `employee/process/payment`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Employee', 'Duty'],
    }),
  }),
});

export const {
  usePostEmployeeAttendanceMutation,
  useFetchEmployeeDutiesQuery,
  useFetchAllEmployeesQuery,
  useFetchAllEmployeesLoansQuery,
  useFetchEmployeeDutyByIdQuery,
  useUpdateEmployeeDutyStatusMutation,
  useDeleteEmployeeDutyMutation,
  usePayUserDueMutation,
  useGetSingleEmployeeQuery,
  useGetEmployeeAllDutiesQuery,

  // employee payment
  useUpdateEmployeePaymentMutation,

  // employee duties summary
  useGetAllEmployeeDutiesWithSummaryQuery,

  //employee approved duties
  useGetEmployeeApprovedDutiesQuery,

  //update employee duty
  useUpdateEmployeeDutyMutation,

  //payment
  useProcessEmployeePaymentMutation,
} = employeeApi;
