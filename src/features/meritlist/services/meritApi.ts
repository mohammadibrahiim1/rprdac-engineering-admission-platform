import { baseApi } from "@/api/baseApi";
import {
  GetCombinedMeritListParams,
  GetMeritRecordsParams,
  SaveMeritDataPayload,
  SaveMeritDataResponse,
  DeleteMeritRecordsPayload,
  DeleteMeritRecordsResponse,
  StudentExamResultResponse,
} from "../types/MeritApi.types";
import { MeritRegistryResponse } from "../types/Merit.types";

// Define a service using a base URL and expected endpoints
export const meritApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveMeritData: builder.mutation<
      SaveMeritDataResponse,
      SaveMeritDataPayload
    >({
      query: (body) => ({
        url: "merit-list/save",
        method: "POST",
        body,
      }),
      // Invalidate the exam list if you have a query for it later
      invalidatesTags: ["MeritExam"],
    }),

    // Get combined merit list (merit-1, merit-2, merit-3)
    getCombinedMeritList: builder.query<
      MeritRegistryResponse,
      GetCombinedMeritListParams
    >({
      query: ({ departmentId, session, page, limit, search }) => {
        return {
          url: "merit-list/combined",
          method: "GET",
          params: {
            departmentId: departmentId.toUpperCase().trim(),
            session: session.trim(),
            page,
            limit,
            search,
          },
        };
      },

      keepUnusedDataFor: 300,
    }),

    // Get student merit list (only a student)
    getStudentExamResult: builder.query<StudentExamResultResponse, void>({
      query: () => "merit-list/my-exams",
      providesTags: ["MeritList"],
    }),

    // Get all merit list
    getMeritRecords: builder.query<
      MeritRegistryResponse,
      GetMeritRecordsParams
    >({
      query: ({ search, page, limit, model, examDate, session }) => {
        return {
          url: "merit-list/all",
          method: "GET",
          params: {
            search,
            page,
            limit,
            model,
            examDate,
            session,
          },
        };
      },

      providesTags: [{ type: "MeritList", id: "LIST" }],
    }),

    // Delete merit list by id(s)
    deleteMeritRecords: builder.mutation<DeleteMeritRecordsResponse, string[]>({
      query: (ids) => ({
        url: "merit-list/batch-delete",
        method: "DELETE",
        body: { ids } as DeleteMeritRecordsPayload,
      }),
      invalidatesTags: [{ type: "MeritList", id: "LIST" }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useSaveMeritDataMutation,
  useGetCombinedMeritListQuery,
  useGetStudentExamResultQuery,
  useDeleteMeritRecordsMutation,
  useGetMeritRecordsQuery,
} = meritApi;
