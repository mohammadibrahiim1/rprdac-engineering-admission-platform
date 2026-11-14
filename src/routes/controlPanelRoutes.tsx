import CreateStaffAccount from "@/features/admin/accountcreationPanel/pages/CreateStaffAccount";
import AdmissionTimelinePage from "@/features/admin/controlPanel/admission-timeline/pages/AdmissionTimelinePage";
import AcademicManager from "@/features/admin/controlPanel/pages/AcademicManager";
import AddResults from "@/features/admin/controlPanel/pages/AddResults";
import BillingRateManager from "@/features/admin/controlPanel/pages/BillingRateManager";
import FAQ from "@/features/admin/controlPanel/pages/FAQ";
import Notice from "@/features/admin/controlPanel/pages/Notice";
import UploadSolutionCopy from "@/features/admin/controlPanel/pages/UploadSolutionCopy";
import SystemLockPage from "@/features/admin/controlPanel/systemLock/pages/SystemLockPage";
import AdminCoursePage from "@/features/admin/courses/pages/AdminCoursePage";
import CombinedMeritPortal from "@/features/meritlist/pages/CombinedMeritPortal";
import MeritList from "@/features/meritlist/pages/MeritList";
import MeritRegistryDashboard from "@/features/meritlist/pages/MeritRegistryDashboard";
import ActivityLogs from "@/redux/features/admin/ActivityLogs";

export const ControlPanelRoutes = [
  {
    path: "admin/notice",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <Notice />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Institutional Notice Board" },
  },
  {
    path: "admin/control/course",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <AdminCoursePage />
      //{" "}
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Institutional Notice Board" },
  },
  {
    path: "admin/billing",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <BillingRateManager />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Billing Rates Configuration" },
  },
  {
    path: "admin/academic/control",
    element: <AcademicManager />,
    handle: { title: "Strategic Academic Control Center" },
  },
  {
    path: "admin/result",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <AddResults />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Publish Academic Results Engine" },
  },
  {
    path: "admin/add/gallery/image",
    // element: (
    //   <AdmissionPrivateRoute panelName="control">
    //     <AddGalleryImage />
    //   </AdmissionPrivateRoute>
    // ),
    handle: { title: "Media Gallery Control Management" },
  },
  {
    path: "admin/upload/solutionCopy",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <UploadSolutionCopy />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Upload Solution Control Center" },
  },
  {
    path: "admin/faq",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <FAQ />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "FAQ Configuration Database" },
  },
  {
    path: "admin/merit-list",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <MeritList />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Merit" },
  },
  {
    path: "admin/admission-timeline",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <AdmissionTimelinePage />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Timeline" },
  },
  {
    path: "admin/activity-logs",
    element: (
      //<AdmissionPrivateRoute panelName="admin">
      <ActivityLogs />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Threat & Audit Activity Logging" },
  },
  {
    path: "admin/system-locks",
    element: (
      //<AdmissionPrivateRoute panelName="admin">
      <SystemLockPage />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Threat & Audit Activity Logging" },
  },

  {
    path: "admin/combined/merit-list",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <CombinedMeritPortal />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Final Merit" },
  },
  {
    path: "admin/all-merit-list",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <MeritRegistryDashboard />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "All Merit Student" },
  },
  {
    path: "create/admission/staff-account",
    element: (
      // <AdmissionPrivateRoute panelName="account">
      <CreateStaffAccount />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Provision Staff Account Engine" },
  },
];
