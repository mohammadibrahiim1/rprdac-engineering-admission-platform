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
  LifeBuoy,
  Send,
  FileEdit,
  BookOpen,
  School,
  HandCoins,
  FileText,
  Volume2,
  ListChecks,
  Workflow,
  FileClock,
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
  UserSquare,
  Truck,
  ClipboardCheck,
  Receipt,
  CardSim,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface NavSubItem {
  title: string;
  url: string;
  icon?: React.ElementType;
}

export interface NavMainItem {
  title: string;
  url?: string;
  icon?: React.ElementType;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  items?: NavSubItem[];
}

export interface ProjectItem {
  name: string;
  url: string;
  icon?: React.ElementType;
}

export interface SidebarData {
  navMain: NavMainItem[];
  navSecondary: NavSecondaryItem[];
  projects: ProjectItem[];
  workspaces: ProjectItem[];
}

/* -------------------------------------------------------------------------- */
/*                                Page Titles                                 */
/* -------------------------------------------------------------------------- */

export const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",

  // Exam Management
  "/dashboard/exam/all": "Exam Management",
  "/dashboard/exam/create": "Create Exam",
  "/dashboard/exam/marks": "Student Marks Entry",
  "/dashboard/exam/results": "Results & Merit List",
  "/dashboard/exam/batch-results": "Batch Results",
  "/dashboard/exam/mcq-upload": "MCQ Upload",
  "/dashboard/exam/students": "Student Management",
  "/dashboard/exam/lookup": "Student Result Lookup",
  "/dashboard/exam/data-management": "Data Management",

  // Student Panel
  "/dashboard/student/admin/student/all": "All Students",
  "/dashboard/student/student-enrollment": "Enroll Student",
  "/dashboard/student/ers/student": "Finance",
  "/dashboard/student/student-admit/registry": "Admit Card Registry",
  "/dashboard/student/invoices/student": "All Invoices",
  "/dashboard/student/transaction/student": "All Transactions",

  // Teacher Panel
  "/dashboard/teacher/admin/add-teacher-class": "Add Teacher Class",
  "/dashboard/teacher/all-teachers": "All Teachers",
  "/dashboard/teacher/all/teachers/class": "All Classes",
  "/dashboard/teacher/request/loan": "Apply For Loan",

  // Employee Panel
  "/dashboard/employee/admin/duties/create": "Add Employee Duty",
  "/dashboard/employee/admin/employees": "All Employees",
  "/dashboard/employee/admin/duties/employees": "All Duties",

  // Nursing Panel
  "/dashboard/nursing/admin/addNursing": "Assign Nursing Duty",
  "/dashboard/nursing/duties/summary": "All Nursings",
  "/dashboard/nursing/duties/all": "All Duties",

  // Announcements Panel
  "/dashboard/user/admin/announcement/all": "Announcement",
  "/dashboard/user/admin/routine": "Make Routine",

  // Users Panel
  "/dashboard/user/all-users": "View All Users",

  // Orders Panel
  "/dashboard/order/admin/order/all": "Orders",
  "/dashboard/order/admin/product-management": "Product",
  "/dashboard/order/admin/shipping": "Shipping",

  // Exam Center
  "/dashboard/exam-center/admin/exam/center": "Green Card",
  "/dashboard/exam-center/generate/admit-card": "Admit Card",

  // Control Panel
  "/dashboard/control/admin/control/course": "Course Management",
  "/dashboard/control/admin/notice": "Notice Management",
  "/dashboard/control/admin/billing": "Billing Management",
  "/dashboard/control/admin/academic/control": "Academic Hub",
  "/dashboard/control/admin/result": "Result Management",
  "/dashboard/control/admin/upload/solutionCopy": "Upload Solution Copy",
  "/dashboard/control/admin/faq": "FAQ Management",
  "/dashboard/control/admin/add/gallery/image": "Media Management",
  "/dashboard/control/admin/system-locks": "System Lock",
  "/dashboard/control/admin/admission-timeline": "Admission Timeline",
  "/dashboard/control/admin/activity-logs": "Activity Logs",
  "/dashboard/control/admin/merit-list": "Upload Merit List",
  "/dashboard/control/admin/combined/merit-list": "Final Merit List",
  "/dashboard/control/admin/all-merit-list": "All Merit List",

  // Staff Access
  "/dashboard/create/admission/staff-account": "User Access Control",
};

/* -------------------------------------------------------------------------- */
/*                                Sidebar Data                                */
/* -------------------------------------------------------------------------- */

export const sidebarData: SidebarData = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Exam Management",
      icon: ClipboardList,
      items: [
        { title: "Exams", url: "/dashboard/exam/all" },
        { title: "Create Exam", url: "/dashboard/exam/create" },
        { title: "Marks Entry", url: "/dashboard/exam/marks" },
        { title: "Results & Merit", url: "/dashboard/exam/results" },
        { title: "Batch Results", url: "/dashboard/exam/batch-results" },
        { title: "MCQ Upload", url: "/dashboard/exam/mcq-upload" },
        { title: "Students", url: "/dashboard/exam/students" },
        { title: "Student Lookup", url: "/dashboard/exam/lookup" },
        { title: "Data Management", url: "/dashboard/exam/data-management" },
      ],
    },
    {
      title: "Student Panel",
      icon: Users,
      items: [
        {
          title: "All Students",
          url: "student/admin/student/all",
          icon: Users,
        },
        {
          title: "Enroll Student",
          url: "student/student-enrollment",
          icon: FileEdit,
        },
        {
          title: "Finance",
          url: "student/ers/student",
          icon: DollarSign,
        },
        {
          title: "Admit Card Registry",
          url: "student/student-admit/registry",
          icon: Receipt,
        },
        {
          title: "All Invoices",
          url: "student/invoices/student",
          icon: Receipt,
        },
        {
          title: "All Transactions",
          url: "student/transaction/student",
          icon: Receipt,
        },
      ],
    },
    {
      title: "Teacher Panel",
      icon: GraduationCap,
      items: [
        {
          title: "Add Teacher Class",
          url: "teacher/admin/add-teacher-class",
          icon: BookOpen,
        },
        {
          title: "All Teachers",
          url: "teacher/all-teachers",
          icon: Users,
        },
        {
          title: "All Classes",
          url: "teacher/all/teachers/class",
          icon: School,
        },
        {
          title: "Apply For Loan",
          url: "teacher/request/loan",
          icon: HandCoins,
        },
      ],
    },
    {
      title: "Employee Panel",
      icon: Briefcase,
      items: [
        {
          title: "Add Employee Duty",
          url: "employee/admin/duties/create",
          icon: ListChecks,
        },
        {
          title: "All Employees",
          url: "employee/admin/employees",
          icon: Users,
        },
        {
          title: "All Duties",
          url: "employee/admin/duties/employees",
          icon: Workflow,
        },
      ],
    },
    {
      title: "Nursing Panel",
      icon: UserCheck,
      items: [
        {
          title: "Assign Nursing Duty",
          url: "nursing/admin/addNursing",
          icon: ListChecks,
        },
        {
          title: "All Nursings",
          url: "nursing/duties/summary",
          icon: Users,
        },
        {
          title: "All Duties",
          url: "nursing/duties/all",
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
          title: "Announcement",
          url: "user/admin/announcement/all",
          icon: Volume2,
        },
        {
          title: "Make Routine",
          url: "user/admin/routine",
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
          title: "View All Users",
          url: "user/all-users",
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
          title: "Orders",
          url: "order/admin/order/all",
          icon: Users,
        },
        {
          title: "Product",
          url: "order/admin/product-management",
          icon: BookOpen,
        },
        {
          title: "Shipping",
          url: "order/admin/shipping",
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
          title: "Green Card",
          url: "exam-center/admin/exam/center",
          icon: Users,
        },
        {
          title: "Admit Card",
          url: "exam-center/generate/admit-card",
          icon: CardSim,
        },
      ],
    },
  ],

  projects: [
    {
      name: "Course Management",
      url: "control/admin/control/course",
      icon: Megaphone,
    },
    {
      name: "Notice Management",
      url: "control/admin/notice",
      icon: Megaphone,
    },
    {
      name: "Billing Management",
      url: "control/admin/billing",
      icon: Banknote,
    },
    {
      name: "Academic Hub",
      url: "control/admin/academic/control",
      icon: GraduationCap,
    },
    {
      name: "Result Management",
      url: "control/admin/result",
      icon: BarChart3,
    },
    {
      name: "Upload Solution Copy",
      url: "control/admin/upload/solutionCopy",
      icon: Upload,
    },
    {
      name: "FAQ Management",
      url: "control/admin/faq",
      icon: HelpCircle,
    },
    {
      name: "Media Management",
      url: "control/admin/add/gallery/image",
      icon: ImagePlus,
    },
    {
      name: "System Lock",
      url: "control/admin/system-locks",
      icon: Lock,
    },
    {
      name: "Admission Timeline",
      url: "control/admin/admission-timeline",
      icon: LineChart,
    },
    {
      name: "Activity Logs",
      url: "control/admin/activity-logs",
      icon: Activity,
    },
    {
      name: "Upload Merit List",
      url: "control/admin/merit-list",
      icon: FileDigit,
    },
    {
      name: "Final Merit List",
      url: "control/admin/combined/merit-list",
      icon: List,
    },
    {
      name: "All Merit List",
      url: "control/admin/all-merit-list",
      icon: List,
    },
  ],

  workspaces: [
    {
      name: "User Access Control",
      url: "control/create/admission/staff-account",
      icon: UserCheck,
    },
  ],
};
