import { ExamFormValues, ExamRecord } from "../types/Exam.types";
import { baseApi } from "@/api/baseApi";

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ১. সব এক্সাম ফেচ করার জন্য (GET /api/exams/all)
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
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamsMutation,
} = examApi;
