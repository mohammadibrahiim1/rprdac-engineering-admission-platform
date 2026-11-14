import StudentAnnouncement from "@/features/admin/announcementPanel/pages/StudentAnnouncement";
import DownloadAdmitCards from "@/features/admin/studentPanel/components/DownloadAdmitCards";
import AllStudents from "@/features/admin/studentPanel/pages/AllStudents";
import EditStudentInformation from "@/features/admin/studentPanel/pages/EditStudentInformation";
import ERS from "@/features/admin/studentPanel/pages/ERS";
import StudentAdmitByAdmin from "@/features/admin/studentPanel/pages/StudentAdmitByAdmin";
import StudentAllInvoices from "@/features/admin/studentPanel/pages/StudentAllInvoices";
import StudentsDetails from "@/features/admin/studentPanel/pages/StudentsDetails";
import StudentTransactions from "@/features/admin/studentPanel/pages/StudentTransactions";

export const StudentPanelRoutes = [
  {
    path: "all-students",
    element: <AllStudents />,
    handle: { title: "Comprehensive Student Matrix" },
  },
  {
    path: "student/details/:id",
    element: <StudentsDetails />,
    handle: { title: "Profile File Inspection" },
  },
  {
    path: "student-enrollment",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <StudentAdmitByAdmin />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Enroll Student | Admin Panel" },
  },
  {
    path: "ers/student",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <ERS />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "ERS | Student Payment Terminal" },
  },
  {
    path: "invoices/student",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <StudentAllInvoices />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Student Financial Invoices" },
  },
  {
    path: "transaction/student",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <StudentTransactions />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Student Financial Invoices" },
  },
  {
    path: "student-admit/registry",
    element: (
      // <AdmissionPrivateRoute panelName="student">
      <DownloadAdmitCards />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Student Admit Card" },
  },
  {
    path: "admin/announcement/student",
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
