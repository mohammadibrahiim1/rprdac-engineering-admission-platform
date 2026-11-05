export interface StudentFormValues {
  // Institutional
  receiptNo: string;
  studentId: string;
  name: string;
  nameInBangla: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;

  // Communication
  phone: string;
  studentWhatsAppNum?: string;
  email?: string;
  guardianName: string;
  guardianPhone: string;
  relationWithGuardian?: string;
  guardianWhatsAppNum?: string;

  // Academic & Batch
  department?: string;
  session?: string;
  batch?: string;
  campus?: string;

  // Address
  permanentZilla?: string;
  permanentUpozilla?: string;
  permanentVillage?: string;
  permanentPostcode?: string;
  presentZilla?: string;
  presentUpozilla?: string;
  presentVillage?: string;
  presentPostcode?: string;
  mess?: string;
  messServiceCharge?: number;

  // Academic Records
  sscGroup?: string;
  sscBoard?: string;
  sscPassingYear?: number | null;
  sscGpa?: number | null;
  diplomaGroup?: string;
  diplomaBoard?: string;
  diplomaPassingYear?: number | null;
  diplomaGpa?: number | null;
  instituteName?: string;

  [key: string]: any;
}

export type EditTabId = 'personal' | 'address' | 'academic' | 'batch';

export interface VerificationItem {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  locked?: boolean;
  statusText?: string;
}

export interface AuditLogItem {
  id: string;
  title: string;
  time: string;
  by: string;
  type?: 'edit' | 'approve' | 'create' | 'payment';
}
