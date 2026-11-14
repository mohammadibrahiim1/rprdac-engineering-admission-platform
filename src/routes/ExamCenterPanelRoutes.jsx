import ExamCenterDashboard from "@/features/admin/examcenter/components/ExamCenterDashboard";
import AdmitCard from "@/features/admin/examcenter/pages/AdmitCard";

export const ExamCenterPanelRoutes = [
  {
    path: "generate/admit-card",
    element: (
      //<AdmissionPrivateRoute panelName="examcenter">
      <AdmitCard />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Generate Dynamic Examination Admit Cards" },
  },
  {
    path: "admin/exam/center",
    element: (
      //<AdmissionPrivateRoute panelName="examcenter">
      <ExamCenterDashboard />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Strategic Exam Center Controller" },
  },
];
