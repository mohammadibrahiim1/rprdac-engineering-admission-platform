import { baseApi } from "@/api/baseApi";
import { FAQApiResponse, FAQFormData, FAQItem } from "../pages/FAQ";

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postFAQ: builder.mutation<FAQItem, FAQFormData>({
      query: (faqData) => ({
        url: "/faq/upload",
        method: "POST",
        body: faqData,
      }),
      invalidatesTags: ["FAQ"],
    }),

    getAllFAQs: builder.query<FAQApiResponse, void>({
      query: () => ({
        url: "faq/all",
      }),
      providesTags: ["FAQ"],
    }),

    deleteQuestion: builder.mutation<
      { success: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/faq/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),
  }),
});

export const {
  usePostFAQMutation,
  useGetAllFAQsQuery,
  useDeleteQuestionMutation,
} = faqApi;
