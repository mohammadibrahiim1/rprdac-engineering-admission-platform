import {
  UserRound,
  Home,
  BookOpen,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export interface EnrollmentSection {
  id: string;
  label: string;
  icon: LucideIcon;
  [key: string]: unknown;
}

export const ENROLLMENT_SECTIONS: EnrollmentSection[] = [
  { id: "personal", label: "Personal Info", icon: UserRound },
  { id: "address", label: "Address", icon: Home },
  { id: "education", label: "Education", icon: BookOpen },
  { id: "payment", label: "Payment", icon: CreditCard },
];
