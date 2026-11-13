import { baseApi } from '../baseApi';

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ search, page, limit, userType, status }) => ({
        url: '/user/all',
        params: { search, page, limit, userType, status },
      }),
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `user/delete/${userId}`,
        method: 'DELETE',
      }),
    }),

    getSingleUser: builder.query({
      query: (userId) => ({
        url: `/user/${userId}`,
      }),
    }),

    updateSingleUser: builder.mutation({
      query: ({ userId, formData }) => ({
        url: `/user/update/${userId}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // assign responsibility as office assistant
    assignUserResponsibility: builder.mutation({
      query: ({ userId, panels }) => ({
        url: `user/${userId}/assign-responsibility`,
        method: 'PUT',
        body: { panels },
      }),
      invalidatesTags: ['Users'],
    }),

    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `auth/user/update/${userId}`,
        method: 'PUT',
        body: { status },
      }),
    }),

    //get admission users
    getAdmissionUsers: builder.query({
      query: ({ search, page, limit, userType }) => ({
        url: '/user/admission-users/all',
        params: { page, limit, search, userType },
      }),
    }),

    // delete user responsibility single or multiple
    removeUserResponsibility: builder.mutation({
      query: ({ roleId, code }) => ({
        url: `user/update/responsibility/${roleId}`,
        method: 'DELETE',
        body: { code },
      }),
      invalidatesTags: ['Users'],
    }),

    getCheckUserStatus: builder.query({
      query: (phone) => `user/status-check/${phone}`,
    }),

    getOnlyTeachers: builder.query({
      query: (search) => ({
        url: '/user/add/teacher',
        params: {
          search,
        },
      }),
    }),

    // update admission staff account
    updateAdmissionUserAccount: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `user/update/admission-user/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['AdmissionUser'],
    }),

    //delete admission user
    deleteAdmissionUsers: builder.mutation({
      query: (ids) => ({
        url: `user/admission-user/delete`,
        method: 'DELETE',
        body: { ids },
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetSingleUserQuery,
  useUpdateSingleUserMutation,
  useAssignAsOfficeAssistantMutation,
  useUpdateUserStatusMutation,
  useRemoveUserResponsibilityMutation,
  useAssignUserResponsibilityMutation, // Assign responsibility as office assistant
  useGetCheckUserStatusQuery, //check user status
  useGetOnlyTeachersQuery,
  //get all admission users
  useGetAdmissionUsersQuery,
  //update admission users
  useUpdateAdmissionUserAccountMutation,
  //delete admission users
  useDeleteAdmissionUsersMutation,
} = userApi;
