import AdminAddTeacherClass from "@/features/admin/teacherPanel/pages/AdminAddTeacherClass";
import AllTeacherClasses from "@/features/admin/teacherPanel/pages/AllTeacherClasses";
import AllTeachers from "@/features/admin/teacherPanel/pages/AllTeachers";
import RequestForLoan from "@/features/admin/teacherPanel/pages/RequestForLoan";
import MyClasses from "@/features/teachers/pages/MyClasses";
import TeacherAllLoanRequest from "@/features/teachers/pages/TeacherAllLoanRequest";
import {
  BookOpen,
  Users,
  School,
  HandCoins,
  Megaphone,
  FileText,
  Volume2,
} from "lucide-react";

export const teacherPanelRoutes = [
  {
    path: "admin/add-teacher-class",
    element: <AdminAddTeacherClass />,
  },
  {
    path: "all-teachers",
    element: <AllTeachers />,
  },
  {
    path: "all/teachers/class",
    element: <AllTeacherClasses />,
  },
  {
    path: "admin/teacher/request/loan",
    element: <RequestForLoan />,
  },
  // {
  //   path: "teacher/announcement",
  //   element: <DisplayTeacherAnnouncementById />,
  // },
  {
    path: "my-classes",
    element: <MyClasses />,
  },
  {
    path: "teacher/all-loans",
    element: <TeacherAllLoanRequest />,
  },
];
