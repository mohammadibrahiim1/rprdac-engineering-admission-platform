import AdminAddTeacherClass from "@/features/admin/teacherPanel/pages/AdminAddTeacherClass";
import AllTeacherClasses from "@/features/admin/teacherPanel/pages/AllTeacherClasses";
import AllTeachers from "@/features/admin/teacherPanel/pages/AllTeachers";
import DisplayTeacherAnnouncementById from "@/features/admin/teacherPanel/pages/DisplayTeacherAnnouncementById";
import RequestForLoan from "@/features/admin/teacherPanel/pages/RequestForLoan";
import MyClasses from "@/features/teachers/pages/MyClasses";
import TeacherAllLoanRequest from "@/features/teachers/pages/TeacherAllLoanRequest";

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
    path: "request/loan",
    element: <RequestForLoan />,
  },
  {
    path: "announcement",
    element: <DisplayTeacherAnnouncementById />,
  },
  {
    path: "my-classes",
    element: <MyClasses />,
  },
  {
    path: "all-loans",
    element: <TeacherAllLoanRequest />,
  },
];
