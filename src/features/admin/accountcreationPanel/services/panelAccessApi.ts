import { baseApi } from "@/api/baseApi";
import {
  ApiSuccessResponse,
  AssignPanelPayload,
  CheckPanelAccessResponse,
  GetAllUsersPanelsResponse,
  GetUserPanelsResponse,
  ManageUserPanelAccessPayload,
  PanelLoginPayload,
  RemovePanelPayload,
  SetPasswordPayload,
} from "../types/PanelAccess.types";

export const panelAccessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ------------------------------ Queries ------------------------------ */

    getUserPanels: builder.query<GetUserPanelsResponse, void>({
      query: () => ({
        url: `/panel/all`,
        method: "GET",
      }),
      providesTags: ["Panels"],
    }),

    checkPanelAccess: builder.query<CheckPanelAccessResponse, string>({
      query: (panelName) => ({
        url: `panel/check-access/${panelName}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (_result, _error, panelName) => [
        { type: "PanelAccess", id: panelName },
      ],
    }),

    getAllUsersPanels: builder.query<GetAllUsersPanelsResponse, void>({
      query: () => ({
        url: "/panel/users-panels",
        method: "GET",
      }),
      providesTags: ["Panels", "User"],
    }),

    /* ----------------------------- Mutations ----------------------------- */

    panelLogin: builder.mutation<ApiSuccessResponse, PanelLoginPayload>({
      query: (data) => ({
        url: `panel/login/to-user`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Panels"],
    }),

    assignPanelToUser: builder.mutation<ApiSuccessResponse, AssignPanelPayload>(
      {
        query: ({ userId, panels, panelPassword, note, routes }) => ({
          url: `/panel/assign/to-user`,
          method: "POST",
          body: {
            userId,
            panels,
            routes,
            panelPassword,
            note,
          },
        }),
        invalidatesTags: ["Panels", "User"],
      },
    ),

    setAdminPanelPassword: builder.mutation<
      ApiSuccessResponse,
      SetPasswordPayload
    >({
      query: (data) => ({
        url: `panel/admin/set-password`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Panels", "User"],
    }),

    manageUserPanelAccess: builder.mutation<
      ApiSuccessResponse,
      ManageUserPanelAccessPayload
    >({
      query: (payload) => ({
        url: `panel/manage-user-access`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Panels", "User"],
    }),

    removePanelFromUser: builder.mutation<
      ApiSuccessResponse,
      RemovePanelPayload
    >({
      query: (data) => ({
        url: `panel/remove/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User", "Panels", "User"],
    }),
  }),
});

export const {
  useGetUserPanelsQuery,
  useGetAllUsersPanelsQuery,
  useCheckPanelAccessQuery,
  useSetAdminPanelPasswordMutation,
  useAssignPanelToUserMutation,
  usePanelLoginMutation,
  useManageUserPanelAccessMutation,
  useRemovePanelFromUserMutation,
} = panelAccessApi;
