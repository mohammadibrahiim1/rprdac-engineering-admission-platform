import { baseApi } from '../baseApi';

export interface Lesson {
  _id: string;
  topicId: string;
  title: string;
  duration?: string;
  videoPath: string;
  uploadStatus?: string;
  isFreePreview?: boolean;
  order: number;
}

export interface Topic {
  _id: string;
  subjectId: string;
  title: string;
  price: number;
  discountPrice?: number;
  order: number;
  isActive: boolean;
  lessons: Lesson[];
  lessonCount: number;
}

export interface Subject {
  _id: string;
  label: string;
  departmentId?: string;
  isCommon: boolean;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  order?: number;
  isActive: boolean;
  options?: string[];
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  thumbnail?: string | null;
  price: number; // Full course price
  discountPrice?: number;
  isActive: boolean;
  subjects?: Subject[];
  topics?: Topic[];
}

export interface CoursesHierarchyResponse {
  success: boolean;
  count?: number;
  data: Course[];
}

export interface DepartmentsResponse {
  success?: boolean;
  data: Course[];
  departments?: Course[];
  [key: string]: any;
}

const subjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subjects
    getSubjects: builder.query({
      query: (debouncedSearch) => ({
        url: 'subject/all',
        params: debouncedSearch ? { debouncedSearch } : {},
      }),
      providesTags: ['Subjects'],
    }),

    // Create subject
    createSubject: builder.mutation({
      query: (subjectData) => ({
        url: 'subject/create',
        method: 'POST',
        body: subjectData,
      }),
      invalidatesTags: ['Subjects'],
    }),

    // Delete multiple subjects
    deleteSubjects: builder.mutation({
      query: (ids) => ({
        url: `/subject/delete/multiple`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Subjects'],
    }),

    // Update subject
    updateSubject: builder.mutation({
      query: ({ id, data }) => ({
        url: `/subject/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Subjects'],
    }),

    // Delete options
    deleteOptions: builder.mutation({
      query: ({ id, options }) => ({
        url: `/subject/${id}/options/delete`,
        method: 'PATCH',
        body: { options },
      }),
      invalidatesTags: ['Subjects'],
    }),

    // Update options
    updateOptions: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/subject/${id}/options/update`,
        method: 'PATCH',
        body: { updates },
      }),
      invalidatesTags: ['Subjects'],
    }),

    // Create department / course
    createDepartment: builder.mutation({
      query: (data) => ({
        url: `/department/create`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Get all departments / courses
    getDepartments: builder.query<Course[] | DepartmentsResponse, void>({
      query: () => `/department/all`,
      providesTags: ['Department'],
    }),

    // 🚀 Get full hierarchical courses (Courses -> Subjects -> Topics -> Lessons)
    getCoursesHierarchy: builder.query<CoursesHierarchyResponse, void>({
      query: () => '/department/courses/hierarchy',
      providesTags: ['Subjects', 'Department'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useDeleteSubjectsMutation,
  useUpdateSubjectMutation,
  useDeleteOptionsMutation,
  useUpdateOptionsMutation,
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useGetCoursesHierarchyQuery,
} = subjectApi;
