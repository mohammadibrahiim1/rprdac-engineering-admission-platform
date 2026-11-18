import {
  CreateResultSheetRequest,
  CreateResultSheetResponse,
  ExamFormValues,
  ExamRecord,
  IResultResponse,
} from "../types/Exam.types";
import { baseApi } from "@/api/baseApi";

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExams: builder.query<
      { success: boolean; results: number; data: ExamRecord[] },
      void
    >({
      query: () => "exams/all",
      providesTags: ["Exam"],
    }),

    // ২. নির্দিষ্ট একটি এক্সাম আইডি দিয়ে ফেচ করার জন্য (GET /api/exams/single/:id)
    getExamById: builder.query<{ success: boolean; data: ExamRecord }, string>({
      query: (id) => `exams/single/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Exam", id }],
    }),

    // ৩. নতুন এক্সাম তৈরির জন্য (POST /api/exams/create)
    createExam: builder.mutation<
      { success: boolean; message: string; data: ExamRecord },
      ExamFormValues
    >({
      query: (newExam) => {
        console.log("newExam payload:", newExam);
        return {
          url: "exams/create",
          method: "POST",
          body: newExam,
        };
      },
      invalidatesTags: ["Exam"],
    }),

    // ৪. পার্শিয়াল আপডেট বা এডিট করার জন্য (PATCH /api/exams/update/:id)
    updateExam: builder.mutation<
      { success: boolean; message: string; patch: ExamRecord },
      { id: string; patch: Partial<ExamFormValues> }
    >({
      query: ({ id, patch }) => ({
        url: `exams/update/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Exam", id },
        { type: "Exam", id: "LIST" },
        "Exam",
      ],
    }),

    createResultSheets: builder.mutation<
      CreateResultSheetResponse,
      CreateResultSheetRequest
    >({
      query: (payload) => ({
        url: "result-sheets/bulk",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ResultSheets"],
    }),

    getResultSheets: builder.query<
      IResultResponse,
      {
        studentId?: string;
        batch?: string;
        page?: number;
        limit?: number | string;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.studentId) queryParams.append("studentId", params.studentId);
        if (params.batch && params.batch !== "all")
          queryParams.append("batch", params.batch);
        if (params.page) queryParams.append("page", String(params.page));
        if (params.limit) queryParams.append("limit", String(params.limit));

        return {
          url: `result-sheets/all?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ResultSheets"],
    }),

    // ৫. সিঙ্গেল বা বাল্ক ডিলিটের জন্য (DELETE /api/exams/delete)
    deleteExams: builder.mutation<
      { success: boolean; message: string },
      string[]
    >({
      query: (ids) => ({
        url: "exams/delete",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: ["Exam"],
    }),
  }),
});

export const {
  useGetExamsQuery,
  useGetExamByIdQuery,
  useGetResultSheetsQuery,
  useCreateExamMutation,
  useCreateResultSheetsMutation,
  useUpdateExamMutation,
  useDeleteExamsMutation,
} = examApi;
