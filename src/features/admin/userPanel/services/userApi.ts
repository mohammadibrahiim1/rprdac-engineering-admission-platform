import { baseApi } from "@/api/baseApi";
import {
  IAssignResponsibilityArgs,
  IDeleteAdmissionUsersArgs,
  IGetUsersQueryParams,
  IPaginatedUserResponse,
  IRemoveResponsibilityArgs,
  IStandardResponse,
  IUpdateAdmissionUserArgs,
  IUpdateSingleUserArgs,
  IUpdateUserStatusArgs,
  IUser,
} from "../types/User.types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<IPaginatedUserResponse, IGetUsersQueryParams>({
      query: (params) => ({
        url: "/user/all",
        params,
      }),
      providesTags: ["User"],
    }),

    deleteUser: builder.mutation<IStandardResponse, string>({
      query: (userId) => ({
        url: `user/delete/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    getSingleUser: builder.query<{ success: boolean; data: IUser }, string>({
      query: (userId) => ({
        url: `/user/${userId}`,
      }),
      providesTags: (_result, _error, userId) => [{ type: "User" }],
    }),

    updateSingleUser: builder.mutation<
      IStandardResponse,
      IUpdateSingleUserArgs
    >({
      query: ({ userId, formData }) => ({
        url: `/user/update/${userId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    // Assign responsibility as office assistant
    assignUserResponsibility: builder.mutation<
      IStandardResponse,
      IAssignResponsibilityArgs
    >({
      query: ({ userId, panels }) => ({
        url: `user/${userId}/assign-responsibility`,
        method: "PUT",
        body: { panels },
      }),
      invalidatesTags: ["User"],
    }),

    updateUserStatus: builder.mutation<
      IStandardResponse,
      IUpdateUserStatusArgs
    >({
      query: ({ userId, status }) => ({
        url: `auth/user/update/${userId}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["User"],
    }),

    // Get admission users
    getAdmissionUsers: builder.query<
      IPaginatedUserResponse,
      IGetUsersQueryParams
    >({
      query: (params) => ({
        url: "/user/admission-users/all",
        params,
      }),
      providesTags: ["AdmissionUser"],
    }),

    // Delete user responsibility single or multiple
    removeUserResponsibility: builder.mutation<
      IStandardResponse,
      IRemoveResponsibilityArgs
    >({
      query: ({ roleId, code }) => ({
        url: `user/update/responsibility/${roleId}`,
        method: "DELETE",
        body: { code },
      }),
      invalidatesTags: ["User"],
    }),

    getCheckUserStatus: builder.query<
      { success: boolean; status: string },
      string
    >({
      query: (phone) => `user/status-check/${phone}`,
    }),

    getOnlyTeachers: builder.query<
      { success: boolean; data: IUser[] },
      string | undefined
    >({
      query: (search) => ({
        url: "/user/add/teacher",
        params: { search },
      }),
      providesTags: ["User"],
    }),

    // Update admission staff account
    updateAdmissionUserAccount: builder.mutation<
      IStandardResponse,
      IUpdateAdmissionUserArgs
    >({
      query: ({ id, ...updateData }) => ({
        url: `user/update/admission-user/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["AdmissionUser"],
    }),

    // Delete admission user
    deleteAdmissionUsers: builder.mutation<
      IStandardResponse,
      IDeleteAdmissionUsersArgs | string[]
    >({
      query: (idsOrPayload) => {
        const body = Array.isArray(idsOrPayload)
          ? { ids: idsOrPayload }
          : idsOrPayload;
        return {
          url: `user/admission-user/delete`,
          method: "DELETE",
          body,
        };
      },
      invalidatesTags: ["AdmissionUser"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetSingleUserQuery,
  useUpdateSingleUserMutation,
  useAssignUserResponsibilityMutation, // Assigned name matching export list
  useUpdateUserStatusMutation,
  useRemoveUserResponsibilityMutation,
  useGetCheckUserStatusQuery,
  useGetOnlyTeachersQuery,
  useGetAdmissionUsersQuery,
  useUpdateAdmissionUserAccountMutation,
  useDeleteAdmissionUsersMutation,
} = userApi;

// Optional alias if needed elsewhere
export const useAssignAsOfficeAssistantMutation =
  useAssignUserResponsibilityMutation;
