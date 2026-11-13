import type { ComponentType } from "react";

/* -------------------------------------------------------------------------- */
/*                                Panel Types                                 */
/* -------------------------------------------------------------------------- */

export type PanelType =
  | "teacher"
  | "nursing"
  | "employee"
  | "announcement"
  | "order"
  | "student"
  | "user"
  | "control"
  | "account"
  | "examcenter";

export type UserRole =
  | "admin"
  | "teacher"
  | "student"
  | "staff"
  | "nursing"
  | string;

/* -------------------------------------------------------------------------- */
/*                              Route Config Types                            */
/* -------------------------------------------------------------------------- */

export interface RouteItem {
  key: string;
  name: string;
  path: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  roles: UserRole[];
}

export interface PanelConfig {
  name: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  path: string;
  panelType: PanelType | string;
  subRoutes: RouteItem[];
}

export interface RouteConfig {
  panels: PanelConfig[];
  controlPanelRoutes: RouteItem[];
  accountPanelRoutes?: RouteItem[];
}

/* -------------------------------------------------------------------------- */
/*                               Access User                                  */
/* -------------------------------------------------------------------------- */

export interface AccessUser {
  _id?: string;
  userId: string;
  userName?: string;
  phone?: string;
  allowedPanels?: string[];
  allowedRoutes?: string[];
}

export interface GetAllUsersPanelsResponse {
  users: AccessUser[];
  success?: boolean;
  message?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Removal State                                 */
/* -------------------------------------------------------------------------- */

export interface RemovalState {
  panels: string[];
  routes: string[];
}

export type RemovalMap = Record<string, RemovalState>;

/* -------------------------------------------------------------------------- */
/*                            API Payload Types                               */
/* -------------------------------------------------------------------------- */

export interface AssignPanelPayload {
  userId: string;
  panels: string[];
  routes: string[];
  panelPassword: string;
  note?: string;
}

export interface RemovePanelPayload {
  userId: string;
  panelsToRemove: string[];
  routesToRemove: string[];
}

export interface SetPasswordPayload {
  panelPasswords: Record<string, string>;
}

export interface PanelLoginPayload {
  // adjust according to your real login body
  userId?: string;
  panelName?: string;
  password?: string;
  [key: string]: unknown;
}

export interface ManageUserPanelAccessPayload {
  userId: string;
  panels?: string[];
  routes?: string[];
  action?: "add" | "remove" | "update";
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                           Generic API Response                             */
/* -------------------------------------------------------------------------- */

export interface ApiSuccessResponse {
  success?: boolean;
  status?: string;
  message?: string;
  data?: unknown;
}

export interface GetUserPanelsResponse {
  panels?: string[];
  routes?: string[];
  success?: boolean;
  message?: string;
}

export interface CheckPanelAccessResponse {
  hasAccess: boolean;
  message?: string;
}
