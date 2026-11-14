import { baseApi } from "@/api/baseApi";
import {
  ICourse,
  CreateCourseInput,
  UpdateCourseInput,
} from "../types/course.types";

export interface GetCoursesParams {
  search?: string;
  courseType?: string;
  code?: string;
  isCommon?: string | boolean;
  isActive?: string | boolean;
  isPublished?: string | boolean;
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<
      { success: boolean; count?: number; data: ICourse[] },
      GetCoursesParams | void
    >({
      query: (params) => ({ url: "/courses/all", params: params || {} }),
      providesTags: ["Courses"],
    }),

    getCourseById: builder.query<{ success: boolean; data: ICourse }, string>({
      query: (id) => `/courses/${id}`,
      providesTags: ["Courses"],
    }),

    // create course
    createCourse: builder.mutation<
      { success: boolean; data: ICourse; message: string },
      CreateCourseInput
    >({
      query: (body) => ({
        url: "/courses/post",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    // update course data
    updateCourse: builder.mutation<
      { success: boolean; data: ICourse; message: string },
      { id: string; body: UpdateCourseInput }
    >({
      query: ({ id, body }) => ({
        url: `/courses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    // delete course
    deleteCourse: builder.mutation<
      { success: boolean; message: string },
      { id?: string; ids?: string[] }
    >({
      query: ({ id, ids }) => ({
        url: id ? `/courses/delete/${id}` : "/courses",
        method: "DELETE",
        body: ids ? { ids } : undefined,
      }),
      invalidatesTags: ["Courses"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseApi;
