import * as React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  Megaphone,
  UserCog,
  PackageSearch,
  FileEdit,
  BookOpen,
  School,
  HandCoins,
  Workflow,
  Volume2,
  ListChecks,
  Banknote,
  BarChart3,
  Upload,
  HelpCircle,
  ImagePlus,
  Lock,
  LineChart,
  Activity,
  FileDigit,
  List,
  DollarSign,
  Truck,
  Receipt,
  CardSim,
} from "lucide-react";

export interface RouteConfigItem {
  key: string;
  panel: string;
  title: string;
  path: string;
  icon?: React.ElementType;
}

export interface NavSubItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  routeKey?: string;
}

export interface NavMainItem {
  title: string;
  url?: string;
  icon?: React.ElementType;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface SidebarData {
  navMain: NavMainItem[];
  navSecondary: NavMainItem[];
  projects: NavSubItem[];
  workspaces: NavSubItem[];
}

/* -------------------------------------------------------------------------- */
/*                        CENTRAL ROUTE CONFIG (SINGLE SOURCE)                */
/* -------------------------------------------------------------------------- */

export const APP_ROUTES: Record<string, RouteConfigItem> = {
  // Overview (Dashboard)
  DASHBOARD: {
    key: "d1",
    panel: "overview",
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  // Exam Management (ex1, ex2...)
  EXAM_ALL: {
    key: "ex1",
    panel: "exam",
    title: "Exam Management",
    path: "/dashboard/exam/all",
    icon: ClipboardList,
  },
  EXAM_CREATE: {
    key: "ex2",
    panel: "exam",
    title: "Create Exam",
    path: "/dashboard/exam/create",
    icon: ClipboardList,
  },
  EXAM_MARKS: {
    key: "ex3",
    panel: "exam",
    title: "Student Marks Entry",
    path: "/dashboard/exam/marks",
    icon: ClipboardList,
  },
  EXAM_RESULTS: {
    key: "ex4",
    panel: "exam",
    title: "Results & Merit List",
    path: "/dashboard/exam/results",
    icon: ClipboardList,
  },
  EXAM_BATCH_RESULTS: {
    key: "ex5",
    panel: "exam",
    title: "Batch Results",
    path: "/dashboard/exam/batch-results",
    icon: ClipboardList,
  },
  EXAM_MCQ_UPLOAD: {
    key: "ex6",
    panel: "exam",
    title: "MCQ Upload",
    path: "/dashboard/exam/mcq-upload",
    icon: ClipboardList,
  },
  EXAM_STUDENTS: {
    key: "ex7",
    panel: "exam",
    title: "Student Management",
    path: "/dashboard/exam/students",
    icon: ClipboardList,
  },
  EXAM_LOOKUP: {
    key: "ex8",
    panel: "exam",
    title: "Student Result Lookup",
    path: "/dashboard/exam/lookup",
    icon: ClipboardList,
  },
  EXAM_DATA_MGMT: {
    key: "ex9",
    panel: "exam",
    title: "Data Management",
    path: "/dashboard/exam/data-management",
    icon: ClipboardList,
  },

  // Student Panel (s1, s2, s3...)
  STUDENT_ALL: {
    key: "s1",
    panel: "student",
    title: "All Students",
    path: "/dashboard/student/admin/student/all",
    icon: Users,
  },
  STUDENT_ENROLL: {
    key: "s2",
    panel: "student",
    title: "Enroll Student",
    path: "/dashboard/student/student-enrollment",
    icon: FileEdit,
  },
  STUDENT_FINANCE: {
    key: "s3",
    panel: "student",
    title: "Finance",
    path: "/dashboard/student/ers/student",
    icon: DollarSign,
  },
  STUDENT_ADMIT_REGISTRY: {
    key: "s4",
    panel: "student",
    title: "Admit Card Registry",
    path: "/dashboard/student/student-admit/registry",
    icon: Receipt,
  },
  STUDENT_INVOICES: {
    key: "s5",
    panel: "student",
    title: "All Invoices",
    path: "/dashboard/student/invoices/student",
    icon: Receipt,
  },
  STUDENT_TRANSACTIONS: {
    key: "s6",
    panel: "student",
    title: "All Transactions",
    path: "/dashboard/student/transaction/student",
    icon: Receipt,
  },

  // Teacher Panel (t1, t2, t3...)
  TEACHER_ADD_CLASS: {
    key: "t1",
    panel: "teacher",
    title: "Add Teacher Class",
    path: "/dashboard/teacher/admin/add-teacher-class",
    icon: BookOpen,
  },
  TEACHER_ALL: {
    key: "t2",
    panel: "teacher",
    title: "All Teachers",
    path: "/dashboard/teacher/all-teachers",
    icon: Users,
  },
  TEACHER_CLASSES: {
    key: "t3",
    panel: "teacher",
    title: "All Classes",
    path: "/dashboard/teacher/all/teachers/class",
    icon: School,
  },
  TEACHER_LOAN: {
    key: "t4",
    panel: "teacher",
    title: "Apply For Loan",
    path: "/dashboard/teacher/request/loan",
    icon: HandCoins,
  },

  // Employee Panel (e1, e2, e3...)
  EMPLOYEE_ADD_DUTY: {
    key: "e1",
    panel: "employee",
    title: "Add Employee Duty",
    path: "/dashboard/employee/admin/duties/create",
    icon: ListChecks,
  },
  EMPLOYEE_ALL: {
    key: "e2",
    panel: "employee",
    title: "All Employees",
    path: "/dashboard/employee/admin/employees",
    icon: Users,
  },
  EMPLOYEE_DUTIES: {
    key: "e3",
    panel: "employee",
    title: "All Duties",
    path: "/dashboard/employee/admin/duties/employees",
    icon: Workflow,
  },

  // Nursing Panel (n1, n2, n3...)
  NURSING_ADD_DUTY: {
    key: "n1",
    panel: "nursing",
    title: "Assign Nursing Duty",
    path: "/dashboard/nursing/admin/addNursing",
    icon: ListChecks,
  },
  NURSING_SUMMARY: {
    key: "n2",
    panel: "nursing",
    title: "All Nursings",
    path: "/dashboard/nursing/duties/summary",
    icon: Users,
  },
  NURSING_DUTIES: {
    key: "n3",
    panel: "nursing",
    title: "All Duties",
    path: "/dashboard/nursing/duties/all",
    icon: Users,
  },

  // Announcements Panel (a1, a2...)
  ANNOUNCEMENT_ALL: {
    key: "a1",
    panel: "announcement",
    title: "Announcement",
    path: "/dashboard/user/admin/announcement/all",
    icon: Volume2,
  },
  ANNOUNCEMENT_ROUTINE: {
    key: "a2",
    panel: "announcement",
    title: "Make Routine",
    path: "/dashboard/user/admin/routine",
    icon: Volume2,
  },

  // Users Panel (u1...)
  USERS_ALL: {
    key: "u1",
    panel: "user",
    title: "View All Users",
    path: "/dashboard/user/all-users",
    icon: Users,
  },

  // Orders Panel (o1, o2, o3...)
  ORDER_ALL: {
    key: "o1",
    panel: "order",
    title: "Orders",
    path: "/dashboard/order/admin/order/all",
    icon: Users,
  },
  ORDER_PRODUCT: {
    key: "o2",
    panel: "order",
    title: "Product",
    path: "/dashboard/order/admin/product-management",
    icon: BookOpen,
  },
  ORDER_SHIPPING: {
    key: "o3",
    panel: "order",
    title: "Shipping",
    path: "/dashboard/order/admin/shipping",
    icon: Truck,
  },

  // Exam Center (ec1, ec2...)
  EXAM_CENTER_GREEN_CARD: {
    key: "ec1",
    panel: "examcenter",
    title: "Green Card",
    path: "/dashboard/exam-center/admin/exam/center",
    icon: Users,
  },
  EXAM_CENTER_ADMIT: {
    key: "ec2",
    panel: "examcenter",
    title: "Admit Card",
    path: "/dashboard/exam-center/generate/admit-card",
    icon: CardSim,
  },

  // Control Panel / Projects (c1, c2, c3...)
  CONTROL_COURSE: {
    key: "c1",
    panel: "control",
    title: "Course Management",
    path: "/dashboard/control/admin/control/course",
    icon: Megaphone,
  },
  CONTROL_NOTICE: {
    key: "c2",
    panel: "control",
    title: "Notice Management",
    path: "/dashboard/control/admin/notice",
    icon: Megaphone,
  },
  CONTROL_BILLING: {
    key: "c3",
    panel: "control",
    title: "Billing Management",
    path: "/dashboard/control/admin/billing",
    icon: Banknote,
  },
  CONTROL_ACADEMIC: {
    key: "c4",
    panel: "control",
    title: "Academic Hub",
    path: "/dashboard/control/admin/academic/control",
    icon: GraduationCap,
  },
  CONTROL_RESULT: {
    key: "c5",
    panel: "control",
    title: "Result Management",
    path: "/dashboard/control/admin/result",
    icon: BarChart3,
  },
  CONTROL_SOLUTION: {
    key: "c6",
    panel: "control",
    title: "Upload Solution Copy",
    path: "/dashboard/control/admin/upload/solutionCopy",
    icon: Upload,
  },
  CONTROL_FAQ: {
    key: "c7",
    panel: "control",
    title: "FAQ Management",
    path: "/dashboard/control/admin/faq",
    icon: HelpCircle,
  },
  CONTROL_MEDIA: {
    key: "c8",
    panel: "control",
    title: "Media Management",
    path: "/dashboard/control/admin/add/gallery/image",
    icon: ImagePlus,
  },
  CONTROL_LOCK: {
    key: "c9",
    panel: "control",
    title: "System Lock",
    path: "/dashboard/control/admin/system-locks",
    icon: Lock,
  },
  CONTROL_TIMELINE: {
    key: "c10",
    panel: "control",
    title: "Admission Timeline",
    path: "/dashboard/control/admin/admission-timeline",
    icon: LineChart,
  },
  CONTROL_LOGS: {
    key: "c11",
    panel: "control",
    title: "Activity Logs",
    path: "/dashboard/control/admin/activity-logs",
    icon: Activity,
  },
  CONTROL_MERIT_LIST: {
    key: "c12",
    panel: "control",
    title: "Upload Merit List",
    path: "/dashboard/control/admin/merit-list",
    icon: FileDigit,
  },
  CONTROL_FINAL_MERIT: {
    key: "c13",
    panel: "control",
    title: "Final Merit List",
    path: "/dashboard/control/admin/combined/merit-list",
    icon: List,
  },
  CONTROL_ALL_MERIT: {
    key: "c14",
    panel: "control",
    title: "All Merit List",
    path: "/dashboard/control/admin/all-merit-list",
    icon: List,
  },

  // Staff Access / Workspaces (w1...)
  STAFF_ACCESS: {
    key: "w1",
    panel: "account",
    title: "User Access Control",
    path: "/dashboard/control/create/admission/staff-account",
    icon: UserCheck,
  },
};

export const pageTitles: Record<string, string> = Object.values(
  APP_ROUTES,
).reduce(
  (acc, route) => {
    acc[route.path] = route.title;
    return acc;
  },
  {} as Record<string, string>,
);

export const sidebarData: SidebarData = {
  navMain: [
    {
      title: "Overview",
      url: APP_ROUTES.DASHBOARD.path,
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: APP_ROUTES.DASHBOARD.title,
          url: APP_ROUTES.DASHBOARD.path,
          routeKey: APP_ROUTES.DASHBOARD.key,
        },
      ],
    },
    {
      title: "Exam Management",
      icon: ClipboardList,
      items: [
        {
          title: APP_ROUTES.EXAM_ALL.title,
          url: APP_ROUTES.EXAM_ALL.path,
          routeKey: APP_ROUTES.EXAM_ALL.key,
        },
        {
          title: APP_ROUTES.EXAM_CREATE.title,
          url: APP_ROUTES.EXAM_CREATE.path,
          routeKey: APP_ROUTES.EXAM_CREATE.key,
        },
        {
          title: APP_ROUTES.EXAM_MARKS.title,
          url: APP_ROUTES.EXAM_MARKS.path,
          routeKey: APP_ROUTES.EXAM_MARKS.key,
        },
        {
          title: APP_ROUTES.EXAM_RESULTS.title,
          url: APP_ROUTES.EXAM_RESULTS.path,
          routeKey: APP_ROUTES.EXAM_RESULTS.key,
        },
        {
          title: APP_ROUTES.EXAM_BATCH_RESULTS.title,
          url: APP_ROUTES.EXAM_BATCH_RESULTS.path,
          routeKey: APP_ROUTES.EXAM_BATCH_RESULTS.key,
        },
        {
          title: APP_ROUTES.EXAM_MCQ_UPLOAD.title,
          url: APP_ROUTES.EXAM_MCQ_UPLOAD.path,
          routeKey: APP_ROUTES.EXAM_MCQ_UPLOAD.key,
        },
        {
          title: APP_ROUTES.EXAM_STUDENTS.title,
          url: APP_ROUTES.EXAM_STUDENTS.path,
          routeKey: APP_ROUTES.EXAM_STUDENTS.key,
        },
        {
          title: APP_ROUTES.EXAM_LOOKUP.title,
          url: APP_ROUTES.EXAM_LOOKUP.path,
          routeKey: APP_ROUTES.EXAM_LOOKUP.key,
        },
        {
          title: APP_ROUTES.EXAM_DATA_MGMT.title,
          url: APP_ROUTES.EXAM_DATA_MGMT.path,
          routeKey: APP_ROUTES.EXAM_DATA_MGMT.key,
        },
      ],
    },
    {
      title: "Student Panel",
      icon: Users,
      items: [
        {
          title: APP_ROUTES.STUDENT_ALL.title,
          url: APP_ROUTES.STUDENT_ALL.path,
          routeKey: APP_ROUTES.STUDENT_ALL.key,
          icon: Users,
        },
        {
          title: APP_ROUTES.STUDENT_ENROLL.title,
          url: APP_ROUTES.STUDENT_ENROLL.path,
          routeKey: APP_ROUTES.STUDENT_ENROLL.key,
          icon: FileEdit,
        },
        {
          title: APP_ROUTES.STUDENT_FINANCE.title,
          url: APP_ROUTES.STUDENT_FINANCE.path,
          routeKey: APP_ROUTES.STUDENT_FINANCE.key,
          icon: DollarSign,
        },
        {
          title: APP_ROUTES.STUDENT_ADMIT_REGISTRY.title,
          url: APP_ROUTES.STUDENT_ADMIT_REGISTRY.path,
          routeKey: APP_ROUTES.STUDENT_ADMIT_REGISTRY.key,
          icon: Receipt,
        },
        {
          title: APP_ROUTES.STUDENT_INVOICES.title,
          url: APP_ROUTES.STUDENT_INVOICES.path,
          routeKey: APP_ROUTES.STUDENT_INVOICES.key,
          icon: Receipt,
        },
        {
          title: APP_ROUTES.STUDENT_TRANSACTIONS.title,
          url: APP_ROUTES.STUDENT_TRANSACTIONS.path,
          routeKey: APP_ROUTES.STUDENT_TRANSACTIONS.key,
          icon: Receipt,
        },
      ],
    },
    {
      title: "Teacher Panel",
      icon: GraduationCap,
      items: [
        {
          title: APP_ROUTES.TEACHER_ADD_CLASS.title,
          url: APP_ROUTES.TEACHER_ADD_CLASS.path,
          routeKey: APP_ROUTES.TEACHER_ADD_CLASS.key,
          icon: BookOpen,
        },
        {
          title: APP_ROUTES.TEACHER_ALL.title,
          url: APP_ROUTES.TEACHER_ALL.path,
          routeKey: APP_ROUTES.TEACHER_ALL.key,
          icon: Users,
        },
        {
          title: APP_ROUTES.TEACHER_CLASSES.title,
          url: APP_ROUTES.TEACHER_CLASSES.path,
          routeKey: APP_ROUTES.TEACHER_CLASSES.key,
          icon: School,
        },
        {
          title: APP_ROUTES.TEACHER_LOAN.title,
          url: APP_ROUTES.TEACHER_LOAN.path,
          routeKey: APP_ROUTES.TEACHER_LOAN.key,
          icon: HandCoins,
        },
      ],
    },
    {
      title: "Employee Panel",
      icon: Briefcase,
      items: [
        {
          title: APP_ROUTES.EMPLOYEE_ADD_DUTY.title,
          url: APP_ROUTES.EMPLOYEE_ADD_DUTY.path,
          routeKey: APP_ROUTES.EMPLOYEE_ADD_DUTY.key,
          icon: ListChecks,
        },
        {
          title: APP_ROUTES.EMPLOYEE_ALL.title,
          url: APP_ROUTES.EMPLOYEE_ALL.path,
          routeKey: APP_ROUTES.EMPLOYEE_ALL.key,
          icon: Users,
        },
        {
          title: APP_ROUTES.EMPLOYEE_DUTIES.title,
          url: APP_ROUTES.EMPLOYEE_DUTIES.path,
          routeKey: APP_ROUTES.EMPLOYEE_DUTIES.key,
          icon: Workflow,
        },
      ],
    },
    {
      title: "Nursing Panel",
      icon: UserCheck,
      items: [
        {
          title: APP_ROUTES.NURSING_ADD_DUTY.title,
          url: APP_ROUTES.NURSING_ADD_DUTY.path,
          routeKey: APP_ROUTES.NURSING_ADD_DUTY.key,
          icon: ListChecks,
        },
        {
          title: APP_ROUTES.NURSING_SUMMARY.title,
          url: APP_ROUTES.NURSING_SUMMARY.path,
          routeKey: APP_ROUTES.NURSING_SUMMARY.key,
          icon: Users,
        },
        {
          title: APP_ROUTES.NURSING_DUTIES.title,
          url: APP_ROUTES.NURSING_DUTIES.path,
          routeKey: APP_ROUTES.NURSING_DUTIES.key,
          icon: Users,
        },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Announcements Panel",
      url: "#",
      icon: Megaphone,
      items: [
        {
          title: APP_ROUTES.ANNOUNCEMENT_ALL.title,
          url: APP_ROUTES.ANNOUNCEMENT_ALL.path,
          routeKey: APP_ROUTES.ANNOUNCEMENT_ALL.key,
          icon: Volume2,
        },
        {
          title: APP_ROUTES.ANNOUNCEMENT_ROUTINE.title,
          url: APP_ROUTES.ANNOUNCEMENT_ROUTINE.path,
          routeKey: APP_ROUTES.ANNOUNCEMENT_ROUTINE.key,
          icon: Volume2,
        },
      ],
    },
    {
      title: "Users Panel",
      url: "#",
      icon: UserCog,
      items: [
        {
          title: APP_ROUTES.USERS_ALL.title,
          url: APP_ROUTES.USERS_ALL.path,
          routeKey: APP_ROUTES.USERS_ALL.key,
          icon: Users,
        },
      ],
    },
    {
      title: "Orders Panel",
      url: "#",
      icon: PackageSearch,
      items: [
        {
          title: APP_ROUTES.ORDER_ALL.title,
          url: APP_ROUTES.ORDER_ALL.path,
          routeKey: APP_ROUTES.ORDER_ALL.key,
          icon: Users,
        },
        {
          title: APP_ROUTES.ORDER_PRODUCT.title,
          url: APP_ROUTES.ORDER_PRODUCT.path,
          routeKey: APP_ROUTES.ORDER_PRODUCT.key,
          icon: BookOpen,
        },
        {
          title: APP_ROUTES.ORDER_SHIPPING.title,
          url: APP_ROUTES.ORDER_SHIPPING.path,
          routeKey: APP_ROUTES.ORDER_SHIPPING.key,
          icon: Truck,
        },
      ],
    },
    {
      title: "Exam Center",
      url: "#",
      icon: PackageSearch,
      items: [
        {
          title: APP_ROUTES.EXAM_CENTER_GREEN_CARD.title,
          url: APP_ROUTES.EXAM_CENTER_GREEN_CARD.path,
          routeKey: APP_ROUTES.EXAM_CENTER_GREEN_CARD.key,
          icon: Users,
        },
        {
          title: APP_ROUTES.EXAM_CENTER_ADMIT.title,
          url: APP_ROUTES.EXAM_CENTER_ADMIT.path,
          routeKey: APP_ROUTES.EXAM_CENTER_ADMIT.key,
          icon: CardSim,
        },
      ],
    },
  ],

  projects: [
    {
      title: APP_ROUTES.CONTROL_COURSE.title,
      url: APP_ROUTES.CONTROL_COURSE.path,
      routeKey: APP_ROUTES.CONTROL_COURSE.key,
      icon: Megaphone,
    },
    {
      title: APP_ROUTES.CONTROL_NOTICE.title,
      url: APP_ROUTES.CONTROL_NOTICE.path,
      routeKey: APP_ROUTES.CONTROL_NOTICE.key,
      icon: Megaphone,
    },
    {
      title: APP_ROUTES.CONTROL_BILLING.title,
      url: APP_ROUTES.CONTROL_BILLING.path,
      routeKey: APP_ROUTES.CONTROL_BILLING.key,
      icon: Banknote,
    },
    {
      title: APP_ROUTES.CONTROL_ACADEMIC.title,
      url: APP_ROUTES.CONTROL_ACADEMIC.path,
      routeKey: APP_ROUTES.CONTROL_ACADEMIC.key,
      icon: GraduationCap,
    },
    {
      title: APP_ROUTES.CONTROL_RESULT.title,
      url: APP_ROUTES.CONTROL_RESULT.path,
      routeKey: APP_ROUTES.CONTROL_RESULT.key,
      icon: BarChart3,
    },
    {
      title: APP_ROUTES.CONTROL_SOLUTION.title,
      url: APP_ROUTES.CONTROL_SOLUTION.path,
      routeKey: APP_ROUTES.CONTROL_SOLUTION.key,
      icon: Upload,
    },
    {
      title: APP_ROUTES.CONTROL_FAQ.title,
      url: APP_ROUTES.CONTROL_FAQ.path,
      routeKey: APP_ROUTES.CONTROL_FAQ.key,
      icon: HelpCircle,
    },
    {
      title: APP_ROUTES.CONTROL_MEDIA.title,
      url: APP_ROUTES.CONTROL_MEDIA.path,
      routeKey: APP_ROUTES.CONTROL_MEDIA.key,
      icon: ImagePlus,
    },
    {
      title: APP_ROUTES.CONTROL_LOCK.title,
      url: APP_ROUTES.CONTROL_LOCK.path,
      routeKey: APP_ROUTES.CONTROL_LOCK.key,
      icon: Lock,
    },
    {
      title: APP_ROUTES.CONTROL_TIMELINE.title,
      url: APP_ROUTES.CONTROL_TIMELINE.path,
      routeKey: APP_ROUTES.CONTROL_TIMELINE.key,
      icon: LineChart,
    },
    {
      title: APP_ROUTES.CONTROL_LOGS.title,
      url: APP_ROUTES.CONTROL_LOGS.path,
      routeKey: APP_ROUTES.CONTROL_LOGS.key,
      icon: Activity,
    },
    {
      title: APP_ROUTES.CONTROL_MERIT_LIST.title,
      url: APP_ROUTES.CONTROL_MERIT_LIST.path,
      routeKey: APP_ROUTES.CONTROL_MERIT_LIST.key,
      icon: FileDigit,
    },
    {
      title: APP_ROUTES.CONTROL_FINAL_MERIT.title,
      url: APP_ROUTES.CONTROL_FINAL_MERIT.path,
      routeKey: APP_ROUTES.CONTROL_FINAL_MERIT.key,
      icon: List,
    },
    {
      title: APP_ROUTES.CONTROL_ALL_MERIT.title,
      url: APP_ROUTES.CONTROL_ALL_MERIT.path,
      routeKey: APP_ROUTES.CONTROL_ALL_MERIT.key,
      icon: List,
    },
  ],

  workspaces: [
    {
      title: APP_ROUTES.STAFF_ACCESS.title,
      url: APP_ROUTES.STAFF_ACCESS.path,
      routeKey: APP_ROUTES.STAFF_ACCESS.key,
      icon: UserCheck,
    },
  ],
};
