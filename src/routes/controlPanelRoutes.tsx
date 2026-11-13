import CreateStaffAccount from "@/features/admin/accountcreationPanel/pages/CreateStaffAccount";
import AdmissionTimelinePage from "@/features/admin/controlPanel/admission-timeline/pages/AdmissionTimelinePage";
import AddResults from "@/features/admin/controlPanel/pages/AddResults";
import BillingRateManager from "@/features/admin/controlPanel/pages/BillingRateManager";
import FAQ from "@/features/admin/controlPanel/pages/FAQ";
import Notice from "@/features/admin/controlPanel/pages/Notice";
import UploadSolutionCopy from "@/features/admin/controlPanel/pages/UploadSolutionCopy";
import CombinedMeritPortal from "@/features/meritlist/pages/CombinedMeritPortal";
import MeritList from "@/features/meritlist/pages/MeritList";
import MeritRegistryDashboard from "@/features/meritlist/pages/MeritRegistryDashboard";

export const ControlPanelRoutes = [
  {
    path: "notice",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <Notice />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Institutional Notice Board" },
  },
  // {
  //   path: "/control/course",
  //   element: (
  //     <AdmissionPrivateRoute panelName="control">
  //     <AdminCoursePage />
  //     // </AdmissionPrivateRoute>
  //   ),
  //   handle: { title: "Institutional Notice Board" },
  // },
  {
    path: "billing",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <BillingRateManager />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Billing Rates Configuration" },
  },
  {
    path: "result",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <AddResults />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Publish Academic Results Engine" },
  },
  {
    path: "add/gallery/image",
    // element: (
    //   <AdmissionPrivateRoute panelName="control">
    //     <AddGalleryImage />
    //   </AdmissionPrivateRoute>
    // ),
    handle: { title: "Media Gallery Control Management" },
  },
  {
    path: "upload/solutionCopy",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <UploadSolutionCopy />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Upload Solution Control Center" },
  },
  {
    path: "faq",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <FAQ />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "FAQ Configuration Database" },
  },
  {
    path: "merit-list",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <MeritList />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Merit" },
  },
  {
    path: "admission-timeline",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <AdmissionTimelinePage />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Timeline" },
  },
  {
    path: "combined/merit-list",
    element: (
      // <AdmissionPrivateRoute panelName="control">
      <CombinedMeritPortal />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Final Merit" },
  },
  {
    path: "all-merit-list",
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
