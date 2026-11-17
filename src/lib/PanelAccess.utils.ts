import { ROUTE_CONFIG } from "@/constants/routes.config";
import { RouteItem } from "@/features/admin/accountcreationPanel/types/PanelAccess.types";

const FALLBACK_PANEL_ROUTES: Record<string, RouteItem[]> = {
  exam: [
    { key: "ex1", name: "Exam Management" },
    { key: "ex2", name: "Create Exam" },
    { key: "ex3", name: "Student Marks Entry" },
    { key: "ex4", name: "Results & Merit List" },
    { key: "ex5", name: "Batch Results" },
    { key: "ex6", name: "MCQ Upload" },
    { key: "ex7", name: "Student Management" },
    { key: "ex8", name: "Student Result Lookup" },
    { key: "ex9", name: "Data Management" },
  ],
  student: [
    { key: "s1", name: "All Students" },
    { key: "s2", name: "Enroll Student" },
    { key: "s3", name: "Finance" },
    { key: "s4", name: "Admit Card Registry" },
    { key: "s5", name: "All Invoices" },
    { key: "s6", name: "All Transactions" },
  ],
  teacher: [
    { key: "t1", name: "Add Teacher Class" },
    { key: "t2", name: "All Teachers" },
    { key: "t3", name: "All Classes" },
    { key: "t4", name: "Apply For Loan" },
  ],
  employee: [
    { key: "e1", name: "Add Employee Duty" },
    { key: "e2", name: "All Employees" },
    { key: "e3", name: "All Duties" },
  ],
  nursing: [
    { key: "n1", name: "Assign Nursing Duty" },
    { key: "n2", name: "All Nursings" },
    { key: "n3", name: "All Duties" },
  ],
  announcement: [
    { key: "a1", name: "Announcement" },
    { key: "a2", name: "Make Routine" },
  ],
  user: [{ key: "u1", name: "View All Users" }],
  order: [
    { key: "o1", name: "Orders" },
    { key: "o2", name: "Product" },
    { key: "o3", name: "Shipping" },
  ],
  examcenter: [
    { key: "ec1", name: "Green Card" },
    { key: "ec2", name: "Admit Card" },
  ],
  control: [
    { key: "c1", name: "Course Management" },
    { key: "c2", name: "Notice Management" },
    { key: "c3", name: "Billing Management" },
    { key: "c4", name: "Academic Hub" },
    { key: "c5", name: "Result Management" },
    { key: "c6", name: "Upload Solution Copy" },
    { key: "c7", name: "FAQ Management" },
    { key: "c8", name: "Media Management" },
    { key: "c9", name: "System Lock" },
    { key: "c10", name: "Admission Timeline" },
    { key: "c11", name: "Activity Logs" },
    { key: "c12", name: "Upload Merit List" },
    { key: "c13", name: "Final Merit List" },
    { key: "c14", name: "All Merit List" },
  ],
  account: [{ key: "w1", name: "User Access Control" }],
};

export function getRoutesForPanel(
  panelType: string,
  userRole: string = "admin",
): RouteItem[] {
  const normalizedPanel = panelType.toLowerCase().replace("panel", "").trim();

  return FALLBACK_PANEL_ROUTES[normalizedPanel] || [];
}
