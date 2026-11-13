import { baseApi } from "@/api/baseApi";

export interface AcademicInfo {
  _id?: string;
  [key: string]: unknown;
}

export interface AcademicDataResponse {
  sscInformation?: string[];
  diplomaInformation?: string[];
  [key: string]: unknown;
}

export interface UpdateAcademicInfoArg {
  id: string;
  path: string;
  items: unknown;
}

export const academicInfoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🟢 POST Academic Info
    addAcademicInfo: builder.mutation<AcademicInfo, unknown>({
      query: (data) => ({
        url: "academic/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AcademicInfo"],
    }),

    // 🟢 GET Academic Info
    getAcademicInfos: builder.query<{ data: AcademicDataResponse }, void>({
      query: () => "academic/all",
      providesTags: ["AcademicInfo"],
    }),

    // Update academic info
    updateAcademicInfo: builder.mutation<AcademicInfo, UpdateAcademicInfoArg>({
      query: ({ id, path, items }) => ({
        url: `/academic/update/${id}`,
        method: "PATCH",
        body: { path, items },
      }),
      invalidatesTags: ["AcademicInfo"],
    }),

    // DELETE Academic Info
    deleteAcademicInfo: builder.mutation<unknown, string[]>({
      query: (ids) => ({
        url: `/academic/delete/items`,
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: ["AcademicInfo"],
    }),
  }),
});

export const {
  useAddAcademicInfoMutation,
  useGetAcademicInfosQuery,
  useUpdateAcademicInfoMutation,
  useDeleteAcademicInfoMutation,
} = academicInfoApi;
