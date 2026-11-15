import AddNursingDuty from "@/features/admin/nursingPanel/pages/AddNursingDuty";
import AllNurses from "@/features/admin/nursingPanel/pages/AllNurses";
import NursingAllAttendance from "@/features/admin/nursingPanel/pages/NursingAllAttendance";
import NursingAllDuties from "@/features/admin/nursingPanel/pages/NursingAllDuties";
import NursingDutiesSummary from "@/features/admin/nursingPanel/pages/NursingDutiesSummary";
import StatementOfANursing from "@/features/admin/nursingPanel/pages/StatementOfANursing";
import Attendance from "@/features/nursing/pages/Attendance";
import MyAttendance from "@/features/nursing/pages/MyAttendance";
import NurseAllLoan from "@/features/nursing/pages/NurseAllLoan";
import NursingLoanRequest from "@/features/nursing/pages/NursingLoanRequest";

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

export const NursingPanelRoutes = [
  {
    path: "duties/summary",
    element: (
      //<AdmissionPrivateRoute panelName="nursing">
      <NursingDutiesSummary />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "Nursing Duties Summary" },
  },
  {
    path: "all-nurses",
    element: (
      //<AdmissionPrivateRoute panelName="nursing">
      <AllNurses />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "All Registered Nurses" },
  },
  {
    path: "statement/:id",
    element: <StatementOfANursing />,
    handle: { title: "Nurse Performance Statement" },
  },
  {
    path: "duties/all",
    element: (
      //<AdmissionPrivateRoute panelName="nursing">
      <NursingAllDuties />
      //</AdmissionPrivateRoute>
    ),
    handle: { title: "All Nursing Duty Logs" },
  },
  {
    path: "admin/addNursing",
    element: (
      // <AdmissionPrivateRoute panelName="nursing">
      <AddNursingDuty />
      // </AdmissionPrivateRoute>
    ),
    handle: { title: "Assign Nursing Duty" },
  },
  {
    path: "nursing-attendance",
    element: <Attendance />,
    handle: { title: "Nurse Attendance Sheet" },
  },
  {
    path: "myAttendance",
    element: <MyAttendance />,
    handle: { title: "My Duty Attendance" },
  },
  {
    path: "allAttendance",
    element: <NursingAllAttendance />,
    handle: { title: "Overall Nursing Attendance" },
  },
  // {
  //   path: "nursing-loan-request",
  //   element: (
  //     //<AdmissionPrivateRoute panelName="nursing">
  //     <NursingLoanRequest />
  //     //</AdmissionPrivateRoute>
  //   ),
  //   handle: { title: "Apply For Nurse Loan" },
  // },
  // {
  //   path: "nurse/all-loans",
  //   element: <NurseAllLoan />,
  //   handle: { title: "Nurse Loan Ledger" },
  // },
  // {
  //   path: "/dashboard/nursing/loans/:id",
  //   element: <Loans />,
  //   loader: async ({ params }) =>
  //     fetch(`${SERVER}/api/nursing/single/loans/${params.id}`),
  //   handle: { title: "Nurse Loan History" },
  // },
];
