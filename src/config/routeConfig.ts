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
} from "lucide-react";

export const pageTitles = {
  "/exam/dashboard": "Dashboard",
  "/exam/exams": "Exam Management",
  "/exam/marks": "Student Marks Entry",
  "/exam/results": "Results & Merit List",
  "/exam/batch-results": "Batch Results",
  "/exam/mcq-upload": "MCQ Upload",
  "/exam/students": "Student Management",
  "/exam/lookup": "Student Result Lookup",
  "/exam/data-management": "Data Management",
};

// sidebar navigation
export const navigationGroups = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/exam/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "EXAM MANAGEMENT",
    items: [
      { label: "Exams", path: "/exam/exams", icon: ClipboardList },
      { label: "Marks Entry", path: "/exam/marks", icon: FilePenLine },
      { label: "Results & Merit", path: "/exam/results", icon: Trophy },
      { label: "Batch Results", path: "/exam/batch-results", icon: Layers },
      { label: "MCQ Upload", path: "/exam/mcq-upload", icon: Upload },
    ],
  },
  {
    title: "STUDENT MANAGEMENT",
    items: [
      { label: "Students", path: "/exam/students", icon: Users },
      { label: "Student Lookup", path: "/exam/lookup", icon: Search },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Data Management",
        path: "/exam/data-management",
        icon: Database,
      },
    ],
  },
];
