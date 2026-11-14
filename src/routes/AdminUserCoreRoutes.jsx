import FAQ from "@/features/admin/controlPanel/pages/FAQ";
import UploadSolutionCopy from "@/features/admin/controlPanel/pages/UploadSolutionCopy";
import AddResults from "@/features/admin/controlPanel/pages/AddResults";
import BillingRateManager from "@/features/admin/controlPanel/pages/BillingRateManager";
import Notice from "@/features/admin/controlPanel/pages/Notice";
import DownloadInvoice from "@/features/admin/teacherPanel/pages/DownloadInvoice";
import AllUsers from "@/features/admin/userPanel/pages/AllUsers";
import RoutineManager from "@/features/admin/announcementPanel/pages/RoutineManager";
import Announcement from "@/features/admin/announcementPanel/pages/Announcement";
import AcademicManager from "@/features/admin/controlPanel/pages/AcademicManager";
import ActivityLogs from "@/redux/features/admin/ActivityLogs";
import UserAccountSettings from "@/features/admin/examcenter/pages/UserAccountSettings";
import AdmissionUser from "@/features/admin/examcenter/pages/AdmissionUser";
import UserStatements from "@/features/admin/examcenter/pages/UserStatements";
import GalleryManagement from "@/features/admin/controlPanel/components/GalleryManagement";

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

export const AdminUserCoreRoutes = [
  // {
  //   path: "admin",
  //   element: (
  //     <AdminRoute>
  //       <DashboardForAdmin />
  //     </AdminRoute>
  //   ),
  //   handle: { title: "System Command Dashboard" },
  // },
  // {
  //   path: "user",
  //   element: (
  //     <UserRoute>
  //       <DashboardForUser />
  //     </UserRoute>
  //   ),
  //   handle: { title: "User Gateway Dashboard" },
  // },

  {
    path: "account/settings/:type",
    element: <UserAccountSettings />,
    handle: { title: "Profile Parameter Control Settings" },
  },
  {
    path: "admission/employee/account",
    element: <AdmissionUser />,
    handle: { title: "Verify Staff Account Portal" },
  },
  {
    path: "admin/announcement/all",
    element: (
      // <AdmissionPrivateRoute panelName="announcement">
      <Announcement />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Global Institutional Announcements" },
  },
  {
    path: "admin/routine",
    element: (
      // <AdmissionPrivateRoute panelName="announcement">
      <RoutineManager />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Dynamic Schedule Routine Processor" },
  },
  {
    path: "all-users",
    element: (
      //<AdmissionPrivateRoute panelName="user">
      <AllUsers />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Administrative Global User Directory" },
  },
  // {
  //   path: "user/:type",
  //   element: <DisplaySingleUser />,
  //   handle: { title: "Categorized Entity Inspector" },
  // },
  {
    path: "user/statement/:id/:userType",
    element: <UserStatements />,
    loader: async ({ params }) =>
      fetch(
        `${SERVER}/api/user/all/statement/${params?.id}/${params?.userType}`,
      ),
    handle: { title: "Cross-Platform Corporate Statements" },
  },
  {
    path: "user/invoice/download/:id",
    element: <DownloadInvoice />,
    loader: async ({ params }) =>
      fetch(`${SERVER}/api/admin/invoice/user/${params.id}`),
    handle: { title: "Enterprise Billing Transaction Invoices" },
  },
  {
    path: "user/admin/notice",
    element: (
      //<AdmissionPrivateRoute panelName="control">
      <Notice />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Institutional Notice Board" },
  },
  {
    path: "user/admin/billing",
    element: (
      //<AdmissionPrivateRoute panelName="control">
      <BillingRateManager />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Billing Rates Configuration" },
  },
  {
    path: "user/admin/result",
    element: (
      //<AdmissionPrivateRoute panelName="control">
      <AddResults />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Publish Academic Results Engine" },
  },
  {
    path: "user/admin/add/gallery/image",
    element: (
      //<AdmissionPrivateRoute panelName="control">
      <GalleryManagement />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Media Gallery Control Management" },
  },
  {
    path: "user/admin/upload/solutionCopy",
    element: (
      //<AdmissionPrivateRoute panelName="control">
      <UploadSolutionCopy />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Upload Solution Control Center" },
  },
  {
    path: "user/admin/faq",
    element: (
      //<AdmissionPrivateRoute panelName="control">
      <FAQ />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "FAQ Configuration Database" },
  },
  // {
  //   path: "user/admin/activity-logs",
  //   element: (
  //     //<AdmissionPrivateRoute panelName="admin">
  //     <ActivityLogs />
  //     //</AdmissionPrivateRoute>
  //   ),
  //   handle: { title: "Threat & Audit Activity Logging" },
  // },
  // {
  //   path: "admin/system-locks",
  //   element: (
  //     //<AdmissionPrivateRoute panelName="admin">
  //     <SystemLockDashboard />
  //     //</AdmissionPrivateRoute>
  //   ),
  //   handle: { title: "Threat & Audit Activity Logging" },
  // },
];
