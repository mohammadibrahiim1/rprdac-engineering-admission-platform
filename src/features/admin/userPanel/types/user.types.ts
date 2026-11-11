export interface IUser {
  _id: string;
  id?: string;
  userName?: string;
  name?: string;
  phone?: string;
  userType?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface IGetUsersQueryParams {
  search?: string;
  page?: number | string;
  limit?: number | string;
  userType?: string;
  status?: string;
}

export interface IPaginatedUserResponse {
  success: boolean;
  message?: string;
  data: IUser[] | { users: IUser[]; total?: number };
  totalItems?: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface IUpdateSingleUserArgs {
  userId: string;
  formData: FormData | Record<string, any>;
}

export interface IAssignResponsibilityArgs {
  userId: string;
  panels: string[];
}

export interface IUpdateUserStatusArgs {
  userId: string;
  status: string;
}

export interface IRemoveResponsibilityArgs {
  roleId: string;
  code: string;
}

export interface IUpdateAdmissionUserArgs {
  id: string;
  [key: string]: any;
}

export interface IDeleteAdmissionUsersArgs {
  ids: string[];
}

export interface IStandardResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}
