import {
  FieldArrayWithId,
  FieldErrors,
  SubmitHandler,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";

export interface IBillingRateRecord {
  id: string;
  billingRateId: string;
  rateId?: string;
  name?: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBillingRatesResponse {
  success: boolean;
  message?: string;
  data: IBillingRateRecord[];
  pagination: IPaginationMeta;
}

export interface IGetBillingRatesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export interface ICreateBillingRatePayload {
  [key: string]: any;
}

export interface IDeleteBillingRateArgs {
  billingRateId: string;
  rateId?: string;
}

export interface IStandardResponse {
  success: boolean;
  message: string;
}

export interface IDeleteArgs {
  billingRateId: string;
  rateId?: string;
}

export interface IBillingRateTableProps {
  data: IBillingRateRecord[];
  pagination: IPaginationMeta;
  onPageChange: (newPage: number) => void;
  onDelete: (args: IDeleteArgs) => void;
  isLoading: boolean;
  register: UseFormRegister<any>;
  isUpdating: boolean;
  editingIndex: string | null;
  handleStartEdit: (row: IBillingRateRecord, rate: any, index: number) => void;
  handleCancelEdit: () => void;
  handleInlineSubmit: SubmitHandler<any>;
  search: string;
  setSearch: (value: string) => void;
}

export interface IUser {
  _id?: string;
  id?: string;
  userName?: string;
  name?: string;
  phone?: string;
  userType?: string;
}

export interface IRateItem {
  _id?: string;
  category: string;
  hourlyRate: number | string;
  secRate: number | string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  [key: string]: any;
}

export interface IInlineUpdateFormValues {
  inlineCategory: string;
  inlineHourlyRate: number | string;
  inlineStartDate: string;
  inlineEndDate: string;
}

export interface IRateField {
  category: string;
  hourlyRate: number | string;
  secRate: number | string;
  startDate?: string;
  endDate?: string;
}

export interface IBillingRateFormValues {
  userType: string;
  rates: IRateField[];
  [key: string]: any;
}

export interface IBillingRateFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface IUpdateBillingRatePayload {
  id: string;
  userType?: string;
  rates: IRateItem[];
  [key: string]: any;
}

export interface IUseBillingRateFormReturn {
  register: UseFormRegister<IBillingRateFormValues>;
  handleCreateSubmit: (e: React.FormEvent) => void;
  errors: FieldErrors<IBillingRateFormValues>;
  isValid: boolean;
  isCreating: boolean;
  fields: FieldArrayWithId<IBillingRateFormValues, "rates", "id">[];
  append: UseFieldArrayAppend<IBillingRateFormValues, "rates">;
  remove: UseFieldArrayRemove;
  handleHourlyRateChange: (index: number, value: string) => void;
  handleSearchChange: (value: string) => void;
  handleUserTypeChange: (value: string) => void;
  userTypeFilter: string;
  usersList: IUser[];
  userLoading: boolean;
  selectedUserIds: string[];
  handleToggleUserSelect: (id: string) => void;
  handleSelectAllToggle: () => void;
}

export interface IUseUpdateBillingRateReturn {
  register: UseFormRegister<IInlineUpdateFormValues>;
  isUpdating: boolean;
  editingIndex: string | null;
  handleStartEdit: (
    row: IBillingRateRecord,
    rate: IRateItem,
    index: number,
  ) => void;
  handleCancelEdit: () => void;
  handleInlineSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
