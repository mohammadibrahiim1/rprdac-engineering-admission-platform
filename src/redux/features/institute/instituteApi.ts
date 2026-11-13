import { baseApi } from "@/api/baseApi";

export interface Institute {
  _id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface GetInstitutesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface InstitutesResponse {
  data?: Institute[];
  [key: string]: unknown;
}

export interface UpdateInstituteArg {
  id: string;
  data: Record<string, unknown>;
}

const instituteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInstitute: builder.mutation<Institute, Institute | Institute[]>({
      query: (data) => ({
        url: `institute/create`,
        method: "POST",
        body: Array.isArray(data) ? data : [data],
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Institute"],
    }),

    // Get institutes
    getInstitutes: builder.query<InstitutesResponse, GetInstitutesParams>({
      query: ({ page = 1, limit = 10, search }) => ({
        url: "institute/all",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["Institute"],
    }),

    // Delete institute (supports single ID string or array of IDs)
    deleteInstitutes: builder.mutation<unknown, string | string[]>({
      query: (data) => {
        if (typeof data === "string") {
          return {
            url: `institute/delete/${data}`,
            method: "DELETE",
          };
        }
        return {
          url: "institute/delete",
          method: "DELETE",
          body: data,
        };
      },
      invalidatesTags: ["Institute"],
    }),

    // Update institute
    updateInstitute: builder.mutation<Institute, UpdateInstituteArg>({
      query: ({ id, data }) => ({
        url: `institute/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Institute"],
    }),
  }),
});

export const {
  useCreateInstituteMutation,
  useGetInstitutesQuery,
  useDeleteInstitutesMutation,
  useUpdateInstituteMutation,
} = instituteApi;
