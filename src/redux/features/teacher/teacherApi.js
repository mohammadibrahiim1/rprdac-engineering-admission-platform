import { baseApi } from '../baseApi';

const teacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // post teacher attendance(active-admin)
    postTeacherAttendance: builder.mutation({
      query: (data) => ({
        url: '/class/create',
        method: 'POST',
        body: data,
      }),
    }),

    // get teachers
    getTeachers: builder.query({
      query: ({ searchQuery, page, limit, filterStatus }) => ({
        url: '/user/teacher',
        params: { searchQuery, page, limit, filterStatus },
      }),
    }),

    // get teachers classes (active-user)
    getTeacherClasses: builder.query({
      query: ({ teacherId, search, page, limit, monthName }) => ({
        url: `/class/teacher/${teacherId}/classes`,
        params: { search, page, limit, monthName },
      }),
    }),

    // fetch course by id
    fetchCourseById: builder.query({
      query: (courseId) => ({
        url: `/class/teacher/class/${courseId}`,
      }),
    }),

    // fetch loan by id
    fetchLoanById: builder.query({
      query: (loanId) => ({
        url: `/loan/${loanId}`,
      }),
    }),

    // update course status
    updateCourseStatus: builder.mutation({
      query: ({ classId, status }) => ({
        url: `admin/teacher/class/status/${classId}`,
        method: 'PUT',
        body: { status },
      }),
    }),

    // update teacher loan status
    updateLoanStatus: builder.mutation({
      query: ({ status, loanRequestId }) => ({
        url: `admin/approve-loan`,
        method: 'PUT',
        body: { status, loanRequestId },
      }),
    }),

    // teacher payment
    teacherPayment: builder.mutation({
      query: ({ userId, payAmount }) => ({
        url: `/admin/user/payment/${userId}`,
        method: 'PUT',
        body: { payAmount },
      }),
    }),

    // approve teacher loan
    approvedLoan: builder.mutation({
      query: ({ loanRequestId, status }) => ({
        url: `admin/approve-loan`,
        method: 'POST',
        body: { loanRequestId, status },
      }),
    }),

    // cancel course
    cancelCourse: builder.mutation({
      query: (courseId) => ({
        url: `admin/class/delete/${courseId}`,
        method: 'DELETE',
      }),
    }),

    // get teachers loan by id
    getTeacherLoanRequest: builder.query({
      query: ({ userId, search, page, limit }) => ({
        url: `loan/${userId}/all-loan`,
        params: { search, page, limit },
      }),
    }),

    // fetch teachers loans
    fetchAllTeachersLoans: builder.query({
      query: (phone) => ({
        url: `admin/all-loan`,
        params: { phone },
      }),
    }),

    teacherPayLoan: builder.mutation({
      query: ({ userId, payAmount }) => ({
        url: `loan/pay-loan/${userId}`,
        method: 'PUT',
        body: {
          payAmount,
        },
      }),
    }),

    // delete teacher class(active-admin)
    deleteTeacherClass: builder.mutation({
      query: (ids) => ({
        url: `/class/teacher/class/delete`,
        method: 'DELETE',
        body: ids,
      }),
      invalidatesTags: ['Class'],
    }),

    // get all pending loans
    getPendingLoans: builder.query({
      query: ({ page, limit, userType, search, status }) => ({
        url: `loan/pending/all`,
        params: {
          page,
          limit,
          userType,
          search,
          status,
        },
      }),
    }),

    // announcement api
    postTeacherAnnouncement: builder.mutation({
      query: (announcementData) => ({
        url: '/teacher/announcement',
        method: 'POST',
        body: announcementData,
      }),
    }),

    getTeacherAllAnnouncements: builder.query({
      query: ({ phone, batch, type, date, search }) => {
        const params = {};
        if (batch) {
          params.batch = batch;
        }
        if (phone) {
          params.phone = phone;
        }
        if (type) {
          params.type = type;
        }
        if (date) {
          params.date = date;
        }
        if (search) {
          params.search = search;
        }
        return { url: '/announcements/all', params };
      },
      providesTags: ['TeacherAnnouncements'],
    }),

    //teacher announcement by id
    getTeacherAnnouncementsById: builder.query({
      query: ({ phone, date, batch, page = 1, limit = 10 }) => ({
        url: `teacher/single/announcements/${phone}`,
        params: { date, batch, page, limit }, // 👈 clean params structure
      }),
    }),

    updateTeacherAnnouncement: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/teacher/update/announcement/${id}`,
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: ['StudentAnnouncement'],
    }),

    deleteTeacherAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/teacher/delete/announcement/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentAnnouncements'], // Update this tag based on your caching
    }),

    // get all classes(active-admin)
    getAllTeacher: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return {
          url: `class/teacher/classes?${queryString}`,
        };
      },
      providesTags: ['Class'],
    }),

    // POST mutation to generate invoice
    updatePaymentAndGenerateTeacherInvoice: builder.mutation({
      query: (body) => ({
        url: 'class/teacher/update/payment',
        method: 'POST',
        body,
      }),
    }),

    //get teacher statements(active-admin)
    getTeacherFinancialStatement: builder.query({
      query: ({ teacherId, ...filters }) => ({
        url: `/class/teacher/${teacherId}/classes`,
        params: {
          ...filters,
        },
      }),
    }),

    // teacher class summary
    getTeacherClassSummary: builder.query({
      query: ({ search, batch, startDate, endDate, page = 1, limit = 10 }) => ({
        url: `class/teacher/classes/all`,
        params: {
          search,
          batch,
          startDate,
          endDate,
          page,
          limit,
        },
      }),
      providesTags: ['Classes'],
    }),

    // get approved data of users
    getTeachersApprovedClasses: builder.query({
      query: ({ page, limit, phone, batch, search }) => ({
        url: `class/teacher/approved/all`,
        params: { page, limit, phone, batch, search },
      }),
    }),

    // get all teacher class list(active-admin)
    getTeacherClassList: builder.query({
      query: (params) => ({
        url: 'class/get/teacher/all/class',
        params,
      }),
      providesTags: ['Class'],
    }),

    // update teacher class(active-admin)
    updateClass: builder.mutation({
      query: ({ id, data }) => ({
        url: `class/teacher/class/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Class'],
    }),

    // teacher payment and generate invoice(active-admin)
    teacherPaymentAndGenerateInvoice: builder.mutation({
      query: (data) => ({
        url: `/class/teacher/payment`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTeachersQuery,
  usePostTeacherAttendanceMutation,
  useFetchCourseByIdQuery,
  useGetTeacherClassesQuery,
  useTeacherPaymentMutation,
  useUpdateCourseStatusMutation,
  useGetTeacherLoanRequestQuery,
  useGetAllTeacherQuery,
  useApprovedLoanMutation,
  useTeacherPayLoanMutation,
  useFetchAllTeachersLoansQuery,
  useFetchLoanByIdQuery,
  useUpdateLoanStatusMutation,
  useCancelCourseMutation,
  useDeleteTeacherClassMutation,
  useGetPendingLoansQuery,
  useUpdatePaymentAndGenerateTeacherInvoiceMutation,
  // announcement export
  usePostTeacherAnnouncementMutation,
  useGetTeacherAllAnnouncementsQuery,
  useUpdateTeacherAnnouncementMutation,
  useDeleteTeacherAnnouncementMutation,
  useGetTeacherAnnouncementsByIdQuery,

  //statements
  useGetTeacherFinancialStatementQuery,

  // teacher class summary
  useGetTeacherClassSummaryQuery,

  //teacher approved classes
  useGetTeachersApprovedClassesQuery,

  //get all teacher class list
  useGetTeacherClassListQuery,

  //update teacher class
  useUpdateClassMutation,

  // teacher payment and generate invoice
  useTeacherPaymentAndGenerateInvoiceMutation,
} = teacherApi;
