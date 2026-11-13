import AllStudents from "@/features/admin/studentPanel/pages/AllStudents";
import EditStudentInformation from "@/features/admin/studentPanel/pages/EditStudentInformation";
import StudentTransactions from "@/features/admin/studentPanel/pages/StudentTransactions";

export const StudentPanelRoutes = [
  // {
  //   path: "/dashboard/add-student",
  //   element: <AddStudents />,
  //   handle: { title: "Enroll Student | Base" },
  // },
  {
    path: "/dashboard/all-students",
    element: <AllStudents />,
    handle: { title: "Comprehensive Student Matrix" },
  },
  {
    path: "/dashboard/student/details/:id",
    element: <StudentsDetails />,
    handle: { title: "Profile File Inspection" },
  },
  {
    path: "/dashboard/student-enrollment",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <StudentAdmitByAdmin />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Enroll Student | Admin Panel" },
  },
  {
    path: "/dashboard/ers/student",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <ERS />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "ERS | Student Payment Terminal" },
  },
  {
    path: "/dashboard/invoices/student",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <StudentAllInvoices />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Student Financial Invoices" },
  },
  {
    path: "/dashboard/transaction/student",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <StudentTransactions />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Student Financial Invoices" },
  },
  {
    path: "/dashboard/student-admit/registry",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <DownloadAdmitCards />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Student Admit Card" },
  },
  {
    path: "/dashboard/admin/announcement/student",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <StudentAnnouncement />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Student General Announcements" },
  },

  {
    path: "admin/student/all",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <AllStudents />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "System Student Rosters" },
  },
  {
    path: "admin/edit/student/:id",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <EditStudentInformation />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Edit Student Info" },
  },
];
