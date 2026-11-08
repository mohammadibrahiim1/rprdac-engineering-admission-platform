import { baseApi } from "@/api/baseApi";
import {
  GetActivityLogsParams,
  GetAdmitCardsParams,
  GetAnnouncementsParams,
  GetSingleAnnouncementParams,
  GetStudentsParams,
  GetTransactionsParams,
  Student,
  StudentsListResponse,
  UpdateAnnouncementPayload,
  UpdateStudentBillingPayload,
  UpdateStudentFinancialPayload,
  UpdateStudentInfoPayload,
  UpdateStudentPaymentPayload,
} from "../../types/allStudents.types";

const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Create Student ──────────────────────────────
    postStudent: builder.mutation<any, any>({
      query: (data) => ({
        url: "/students/create",
        method: "POST",
        body: data,
      }),
    }),

    publicEnrollment: builder.mutation<any, any>({
      query: (data) => ({
        url: "/students/public-enroll",
        method: "POST",
        body: data,
      }),
    }),

    // ── Session Folders ─────────────────────────────
    getSessionFolders: builder.query<any, void>({
      query: () => "students/sessions/folders",
    }),

    // ── Students List ───────────────────────────────
    getStudents: builder.query<StudentsListResponse, GetStudentsParams | void>({
      query: (params) => ({
        url: "students/all",
        params: params || {},
      }),
    }),

    getStudentById: builder.query<Student, string>({
      query: (id) => `/students/single/${id}`,
    }),

    // ── Payment Related ─────────────────────────────
    getStudentPaymentByStudentId: builder.query<any, string>({
      query: (studentId) => `students/payment/${studentId}`,
      providesTags: (_result, _error, id) => [
        { type: "StudentPayment" as const, id },
      ],
    }),

    updateStudentPaymentWithCGPA: builder.mutation<
      any,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/students/payment/${id}/update/cgpa`,
        method: "PATCH",
        body: data,
      }),
    }),

    updateStudentDuePayment: builder.mutation<any, UpdateStudentPaymentPayload>(
      {
        query: ({ studentId, ...body }) => ({
          url: `/students/update-payment/${studentId}`,
          method: "PUT",
          body,
        }),
      },
    ),

    updateStudentFinancial: builder.mutation<
      any,
      UpdateStudentFinancialPayload
    >({
      query: ({ id, data }) => ({
        url: `/students/${id}/financial`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        "Students" as const,
        { type: "Student" as const, id },
      ],
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          studentApi.util.updateQueryData("getStudentById", id, (draft) => {
            if (data.payAmount && data.payAmount > 0) {
              draft.studentPaid = (draft.studentPaid || 0) + data.payAmount;
              draft.dueAmount = Math.max(
                0,
                (draft.dueAmount || 0) - data.payAmount,
              );
            }
            if (data.cgpaDiscount !== undefined) {
              draft.cgpaDiscount = data.cgpaDiscount;
            }
            if (data.referenceDiscount !== undefined) {
              draft.referenceDiscount = data.referenceDiscount;
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateStudentBilling: builder.mutation<any, UpdateStudentBillingPayload>({
      query: ({ id, billingData }) => ({
        url: `/students/${id}/update-billing`,
        method: "PATCH",
        body: billingData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Student" as const, id },
      ],
    }),

    // ── Update Student Info ─────────────────────────
    updateStudentInformation: builder.mutation<any, UpdateStudentInfoPayload>({
      query: ({ id, data }) => ({
        url: `/students/update/info/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: ["Student" as const],
    }),

    updateStudentInfoByOwn: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: `/students/update-profile`,
        method: "PATCH",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Student" as const],
    }),

    // ── Transactions ────────────────────────────────
    getTransactions: builder.query<any, GetTransactionsParams | void>({
      query: (params = {}) => {
        const safeParams = params || {};
        const searchParams = new URLSearchParams();

        Object.entries(safeParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });

        return {
          url: `students/transactions?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Transactions" as const],
      keepUnusedDataFor: 60,
    }),

    // ── Announcements ───────────────────────────────
    postStudentAnnouncement: builder.mutation<any, any>({
      query: (announcementData) => ({
        url: "/student/announcement",
        method: "POST",
        body: announcementData,
      }),
    }),

    getAllAnnouncements: builder.query<any, GetAnnouncementsParams | void>({
      query: (params) => ({
        url: "/student/announcements",
        params: params || {},
      }),
      providesTags: ["StudentAnnouncement" as const],
    }),

    getSingleStudentAnnouncement: builder.query<
      any,
      GetSingleAnnouncementParams
    >({
      query: ({ batch, page = 1, limit = 5, date, type }) => ({
        url: `/student/single/announcement/${batch}`,
        params: { page, limit, date, type },
      }),
    }),

    updateStudentAnnouncement: builder.mutation<any, UpdateAnnouncementPayload>(
      {
        query: ({ id, updatedData }) => ({
          url: `/student/update/announcement/${id}`,
          method: "PATCH",
          body: updatedData,
        }),
        invalidatesTags: ["Announcements" as const],
      },
    ),

    deleteStudentAnnouncement: builder.mutation<any, string>({
      query: (id) => ({
        url: `/student/delete/announcement/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentAnnouncements" as const],
    }),

    // ── Delete Students ─────────────────────────────
    deleteStudentsByIds: builder.mutation<any, string[]>({
      query: (ids) => ({
        url: "students/delete",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: [{ type: "Students" as const, id: "LIST" }],
    }),

    // ── Admit Cards ─────────────────────────────────
    createBulkAdmitCard: builder.mutation<any, any>({
      query: (body) => ({
        url: "admit-card/generate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdmitCard" as const],
    }),

    getAdmitCards: builder.query<any, GetAdmitCardsParams | void>({
      query: (params) => ({
        url: "admit-card/find/all",
        method: "GET",
        params: {
          page: params?.page || 1,
          limit: params?.limit || 25,
          examType: params?.examType,
          department: params?.department,
          startId: params?.startId,
          endId: params?.endId,
          date: params?.date,
        },
      }),
      providesTags: ["AdmitCard" as const],
    }),

    deleteBulkAdmitCardsByDate: builder.mutation<any, string>({
      query: (date) => ({
        url: "admit-card/bulk-delete-by-date",
        method: "DELETE",
        body: { date },
      }),
      invalidatesTags: ["AdmitCard" as const],
    }),

    // ── Activity Logs ───────────────────────────────
    getStudentsActivityLogs: builder.query<any, GetActivityLogsParams | void>({
      query: (params) => ({
        url: `/students/activity/logs`,
        params: params || {},
      }),
      providesTags: ["StudentActivityLogs" as const],
    }),
  }),
});

// ────────────────────────────────────────────────
// Export Hooks
// ────────────────────────────────────────────────
export const {
  usePostStudentMutation,
  usePublicEnrollmentMutation,
  useGetSessionFoldersQuery,
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentPaymentByStudentIdQuery,
  useUpdateStudentPaymentWithCGPAMutation,
  useUpdateStudentDuePaymentMutation,
  useUpdateStudentInformationMutation,
  useUpdateStudentInfoByOwnMutation,
  useUpdateStudentFinancialMutation,
  useUpdateStudentBillingMutation,
  useGetTransactionsQuery,
  usePostStudentAnnouncementMutation,
  useGetAllAnnouncementsQuery,
  useGetSingleStudentAnnouncementQuery,
  useUpdateStudentAnnouncementMutation,
  useDeleteStudentAnnouncementMutation,
  useDeleteStudentsByIdsMutation,
  useCreateBulkAdmitCardMutation,
  useGetAdmitCardsQuery,
  useDeleteBulkAdmitCardsByDateMutation,
  useGetStudentsActivityLogsQuery,
} = studentApi;

export default studentApi;
