import { baseApi } from "@/api/baseApi";

export const announcementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAnnouncement: builder.mutation({
      query: (announcementData) => ({
        url: "/announcements/create",
        method: "POST",
        body: announcementData,
      }),
    }),

    getAnnouncements: builder.query({
      query: (params) => ({
        url: "/announcements/all",
        params,
      }),
      providesTags: ["Announcement"],
    }),

    // student/all

    getStudentAnnouncements: builder.query({
      query: (params) => ({
        url: `/announcements/student/all`,
        params,
      }),
      providesTags: ["Announcement"],
    }),

    getTeacherAnnouncements: builder.query({
      query: ({ phone, ...params }) => ({
        url: `/announcements/all`,
        params,
      }),
      providesTags: ["Announcement"],
    }),

    //delete announcement
    updateAnnouncements: builder.mutation({
      query: ({ id, data }) => ({
        url: `/announcements/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Announcement"],
    }),

    //delete announcement
    deleteAnnouncements: builder.mutation({
      query: (id) => ({
        url: `/announcements/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Announcement"],
    }),
  }),
});

export const {
  useCreateAnnouncementMutation,
  useGetAnnouncementsQuery,
  useGetTeacherAnnouncementsQuery,
  useGetStudentAnnouncementsQuery,
  useDeleteAnnouncementsMutation,
  useUpdateAnnouncementsMutation,
} = announcementApi;
