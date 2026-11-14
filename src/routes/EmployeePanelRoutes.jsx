import AdminAddEmployeeDuties from "@/features/admin/employeePanel/pages/AdminAddEmployeeDuties";
import AllEmployeeLoans from "@/features/admin/employeePanel/pages/AllEmployeeLoans";
import AllEmployees from "@/features/admin/employeePanel/pages/AllEmployees";
import EmployeeAllDuties from "@/features/admin/employeePanel/pages/EmployeeAllDuties";
import RequestForLoanEmployee from "@/features/admin/employeePanel/pages/RequestForLoanEmployee";
import StatementOfAEmployee from "@/features/admin/employeePanel/pages/StatementOfAEmployee";
import AllStaff from "@/features/employee/pages/AllStaff";
import StaffAllLoans from "@/features/employee/pages/StaffAllLoans";
import StaffAttendance from "@/features/employee/pages/StaffAttendance";

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

export const EmployeePanelRoutes = [
  {
    path: "admin/duties/employees",
    element: <EmployeeAllDuties />,
    handle: { title: "Employee Duties Board" },
  },
  {
    path: "admin/employees",
    element: <AllEmployees />,
    handle: { title: "Corporate Employees Roster" },
  },
  {
    path: "/dashboard/employee/statements/:id",
    element: <StatementOfAEmployee />,
    handle: { title: "Employee Payroll Statement" },
  },
  {
    path: "/dashboard/employee/loan/:id",
    element: <AllEmployeeLoans />,
    loader: async ({ params }) =>
      fetch(`${SERVER}/api/employee/single/loans/${params?.id}`),
    handle: { title: "Employee Loan Overview" },
  },
  {
    path: "employee/duties",
    element: <AllStaff />,
    handle: { title: "Staff Assigned Rosters" },
  },
  {
    path: "employee/duties/assign",
    element: <StaffAttendance />,
    handle: { title: "Record Staff Attendance" },
  },
  {
    path: "admin/loans/requests",
    element: <RequestForLoanEmployee />,
    handle: { title: "Review Employee Loans" },
  },
  {
    path: "admin/duties/create",
    element: <AdminAddEmployeeDuties />,
    handle: { title: "Generate Corporate Tasks" },
  },
  {
    path: "employee/loans",
    element: <StaffAllLoans />,
    handle: { title: "Staff Personal Loans" },
  },
  // {
  //   path: "teacher-attendance",
  //   element: <TeacherAttendance />,
  //   handle: { title: "Global Teacher Tracking Logs" },
  // },
];
