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
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: NavSubItem[];
}

export const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/exam/exams": "Exam Management",
  "/exam/marks": "Student Marks Entry",
  "/exam/results": "Results & Merit List",
  "/exam/batch-results": "Batch Results",
  "/exam/mcq-upload": "MCQ Upload",
  "/exam/students": "Student Management",
  "/exam/lookup": "Student Result Lookup",
  "/exam/data-management": "Data Management",
};

export const sidebarData = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <LayoutDashboard />,
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
      // url: "#", // Dropdown open/close er jonno # dewa holo
      icon: <ClipboardList />,
      isActive: true,
      items: [
        {
          title: "Exams",
          url: "/exam/all",
        },
        {
          title: "Create Exam",
          url: "/exam/create",
        },
        {
          title: "Marks Entry",
          url: "/exam/marks",
        },
        {
          title: "Results & Merit",
          url: "/exam/results",
        },
        {
          title: "Batch Results",
          url: "/exam/batch-results",
        },
        {
          title: "MCQ Upload",
          url: "/exam/mcq-upload",
        },
        {
          title: "Students",
          url: "/exam/students",
        },
        {
          title: "Student Lookup",
          url: "/exam/lookup",
        },
        {
          title: "Data Management",
          url: "/exam/data-management",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoy />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <Send />,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: <Frame />,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <PieChart />,
    },
    {
      name: "Travel",
      url: "#",
      icon: <Luggage />,
    },
  ],
  workspaces: [
    {
      name: "User Access control",
      url: "create/admission/staff-account",
      icon: <UserCheck />,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <PieChart />,
    },
    {
      name: "Travel",
      url: "#",
      icon: <Luggage />,
    },
  ],
};
