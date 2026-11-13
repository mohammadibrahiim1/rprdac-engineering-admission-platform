import * as React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  FilePenLine,
  Trophy,
  Users,
  Search,
  Layers,
  Upload,
  Database,
  LifeBuoy,
  Send,
  Frame,
  PieChart,
  Luggage,
  UserCheck,
  Settings2,
  Megaphone,
  Lock,
  FileDigit,
  Activity,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavMainItem {
  title: string;
  url?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon?: React.ReactNode;
}

export interface ProjectItem {
  name: string;
  url: string;
  icon?: React.ReactNode;
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

  // Control Panel
  "/dashboard/control/notice": "Notice Management",
  "/dashboard/control/billing": "Billing Management",
  "/dashboard/control/course": "Course Management",
  "/dashboard/control/result": "Result Management",
  "/dashboard/control/faq": "FAQ Management",
  "/dashboard/control/gallery": "Media Management",
  "/dashboard/control/system-locks": "System Lock",
  "/dashboard/control/admission-timeline": "Admission Timeline",
  "/dashboard/control/activity-logs": "Activity Logs",
  "/dashboard/control/merit-list": "Upload Merit List",
  "/dashboard/control/combined/merit-list": "Final Merit List",
  "/dashboard/control/all-merit-list": "All Merit List",
  "/dashboard/control/academic/control": "Academic Hub",
  "/dashboard/control/upload/solutionCopy": "Upload Solution Copy",

  // Staff Access
  "/dashboard/create/admission/staff-account": "User Access Control",
};

/* -------------------------------------------------------------------------- */
/*                               Sidebar Data                                 */
/* -------------------------------------------------------------------------- */

export const sidebarData: SidebarData = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
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
      icon: <ClipboardList className="h-4 w-4" />,
      isActive: true,
      items: [
        {
          title: "Exams",
          url: "/dashboard/exam/all",
        },
        {
          title: "Create Exam",
          url: "/dashboard/exam/create",
        },
        {
          title: "Marks Entry",
          url: "/dashboard/exam/marks",
        },
        {
          title: "Results & Merit",
          url: "/dashboard/exam/results",
        },
        {
          title: "Batch Results",
          url: "/dashboard/exam/batch-results",
        },
        {
          title: "MCQ Upload",
          url: "/dashboard/exam/mcq-upload",
        },
        {
          title: "Students",
          url: "/dashboard/exam/students",
        },
        {
          title: "Student Lookup",
          url: "/dashboard/exam/lookup",
        },
        {
          title: "Data Management",
          url: "/dashboard/exam/data-management",
        },
      ],
    },
    {
      title: "Control Panel",
      icon: <Settings2 className="h-4 w-4" />,
      items: [
        {
          title: "Notice Management",
          url: "/dashboard/control/notice",
        },
        {
          title: "Billing",
          url: "/dashboard/control/billing",
        },
        {
          title: "Course Management",
          url: "/dashboard/control/course",
        },
        {
          title: "Result Management",
          url: "/dashboard/control/result",
        },
        {
          title: "FAQ",
          url: "/dashboard/control/faq",
        },
        {
          title: "Media / Gallery",
          url: "/dashboard/control/gallery",
        },
        {
          title: "System Lock",
          url: "/dashboard/control/system-locks",
        },
        {
          title: "Admission Timeline",
          url: "/dashboard/control/admission-timeline",
        },
        {
          title: "Activity Logs",
          url: "/dashboard/control/activity-logs",
        },
        {
          title: "Upload Merit List",
          url: "/dashboard/control/merit-list",
        },
        {
          title: "Final Merit List",
          url: "/dashboard/control/combined/merit-list",
        },
        {
          title: "All Merit List",
          url: "/dashboard/control/all-merit-list",
        },
        {
          title: "Academic Hub",
          url: "/dashboard/control/academic/control",
        },
        {
          title: "Upload Solution Copy",
          url: "/dashboard/control/upload/solutionCopy",
        },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoy className="h-4 w-4" />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <Send className="h-4 w-4" />,
    },
  ],

  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: <Frame className="h-4 w-4" />,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <PieChart className="h-4 w-4" />,
    },
    {
      name: "Travel",
      url: "#",
      icon: <Luggage className="h-4 w-4" />,
    },
  ],

  workspaces: [
    {
      name: "User Access Control",
      url: "/dashboard/create/admission/staff-account",
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <PieChart className="h-4 w-4" />,
    },
    {
      name: "Travel",
      url: "#",
      icon: <Luggage className="h-4 w-4" />,
    },
  ],
};
