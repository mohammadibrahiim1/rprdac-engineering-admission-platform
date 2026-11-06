export type UserStatus = "approved" | "pending" | "rejected";

export interface Responsibility {
  panel: string;
}

export interface User {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  userType: "teacher" | "staff" | "nursing" | "admin" | "all" | "super-admin";
  role: string;
  department: string;
  status: UserStatus;
  profilePicture?: string;
  twoFactorAuth: string;
  lastActive: string;
  responsibility?: Responsibility[];
  createdAt: string;
  allowedPanels: [];
  panelName: string;
}

export interface PaginationMeta {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  limit: number;
}
