// ────────────────────────────────────────────────
// Core Student Types
// ────────────────────────────────────────────────

export interface Student {
  _id: string;
  name: string;
  studentId?: string;
  studentPhoto?: string;
  phone?: string;
  mobile?: string;
  session?: string;
  batch?: string;
  department?: string;
  instituteName?: string;
  mess?: string;
  dueAmount?: number;
  studentPaid?: number;
  paymentStatus?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone?: string;
  examPasscode?: string;
  rollNo?: string;
  registryId?: string;
  cgpaDiscount?: number;
  referenceDiscount?: number;
  [key: string]: any;
}

export interface StudentMeta {
  totalItems: number;
  totalPages: number;
  currentPage?: number;
  limit?: number | string;
}

export interface StudentStats {
  paidCount: number;
  dueCount: number;
  payRate: number;
  totalItems: number;
  totalEnrolled?: number;
}

export type ExportableField =
  | "name"
  | "studentId"
  | "phone"
  | "session"
  | "batch"
  | "department"
  | "instituteName"
  | "mess"
  | "dueAmount"
  | "paymentStatus"
  | "fatherName"
  | "motherName"
  | "guardianPhone";

export interface Batch {
  _id: string;
  title: string;
  [key: string]: unknown;
}

// ────────────────────────────────────────────────
// API Query / Mutation Params
// ────────────────────────────────────────────────

export interface GetStudentsParams {
  page?: number;
  limit?: number | string;
  search?: string;
  batch?: string;
  session?: string;
  status?: string;
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export interface GetAnnouncementsParams {
  search?: string;
  batch?: string;
  type?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface GetSingleAnnouncementParams {
  batch: string;
  page?: number;
  limit?: number;
  date?: string;
  type?: string;
}

export interface GetAdmitCardsParams {
  page?: number;
  limit?: number;
  examType?: string;
  department?: string;
  startId?: string;
  endId?: string;
  date?: string;
}

export interface GetActivityLogsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  studentId?: string;
}

// ────────────────────────────────────────────────
// Mutation Payloads
// ────────────────────────────────────────────────

export interface UpdateStudentPaymentPayload {
  studentId: string;
  payAmount: number;
  paymentMethod?: string;
  accountNumber?: string;
  transactionId?: string;
  paymentDate?: string;
}

export interface UpdateStudentFinancialPayload {
  id: string;
  data: {
    payAmount?: number;
    cgpaDiscount?: number;
    referenceDiscount?: number;
    [key: string]: any;
  };
}

export interface UpdateStudentBillingPayload {
  id: string;
  billingData: any;
}

export interface UpdateStudentInfoPayload {
  id: string;
  data: any;
}

export interface UpdateAnnouncementPayload {
  id: string;
  updatedData: any;
}

export interface StudentFormState {
  receiptNo: string;
  name: string;
  nameInBangla: string;
  phone: string;
  studentWhatsAppNum: string;
  studentId: string;
  department: string;
  batch: string;
  oldBatch: string;
  newBatch: string;
  session: string;
  instituteName: string;

  guardianName: string;
  guardianPhone: string;
  relationWithGuardian: string;
  guardianWhatsAppNum: string;

  permanentVillage: string;
  permanentUpozilla: string;
  permanentPostcode: string;
  permanentZilla: string;

  presentVillage: string;
  presentUpozilla: string;
  presentPostcode: string;
  presentZilla: string;
  sameAsPermanent: boolean;

  mess: string;
  room: string;
  messServiceCharge: number;
  messServiceChargePaid: number;

  bloodGroup: string;
  studentPhoto: File | string | null;
  imageURL?: string;

  // Academic
  sscGroup: string;
  sscBoard: string;
  sscPassingYear: number | null;
  sscGpa: number | null;

  diplomaGroup: string;
  diplomaBoard: string;
  diplomaPassingYear: number | null;
  diplomaGpa: number | null;

  // Financial
  courseFee: number;
  admissionFee: number;
  admissionFeePaid: number;
  dueAmount: number;

  accountNumber: string;
  transactionId: string;
  paymentMethod: string;

  cgpa: number | null;
  cgpaDiscount: number;
  referenceDiscount: number;
  cashback: number;
  studentReturnAmount: number;
  totalAfterDiscount: number;
  deductMoney: number;
}

export interface StudentSliceState {
  student: StudentFormState;
  loading: boolean;
  error: string | null;
}

export interface UpdateFieldPayload {
  name?: string;
  key?: string;
  value: any;
}

// ────────────────────────────────────────────────
// Common API Response Shapes (optional but useful)
// ────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: StudentMeta;
  statistics?: Partial<StudentStats>;
}

export interface StudentsListResponse {
  data: Student[];
  meta: StudentMeta;
  statistics?: Partial<StudentStats>;
}
