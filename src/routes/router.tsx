import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import { LoginForm } from "@/features/auth/pages/LoginForm";
import { ProtectedRoute } from "./ProtectedRoutes";
import { examRoutes } from "./examManagementRoutes";

import { Unauthorized } from "@/components/common/Unauthorized";
import { Welcome } from "@/components/common/Welcome";
import { Dashboard } from "@/components/common/Dashboard";
import { ControlPanelRoutes } from "./controlPanelRoutes";
import { StudentPanelRoutes } from "./studentPanelRoutes";
import { teacherPanelRoutes } from "./teacherPanelRoutes";
import { EmployeePanelRoutes } from "./EmployeePanelRoutes";
import { NursingPanelRoutes } from "./NursingPanelRoutes";
import { OrderPanelRoutes } from "./OrderPanelRoutes";
import { AdminUserCoreRoutes } from "./AdminUserCoreRoutes";
import { ExamCenterPanelRoutes } from "./ExamCenterPanelRoutes";
import NotFound from "@/components/common/NotFound";
import { PanelAuthGuard } from "./PanelAuthGuard";

const DASHBOARD_PATH = "/dashboard";

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <div>Register Page</div>,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },

  // Protected Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/welcome",
        element: <Welcome />,
      },

      {
        path: DASHBOARD_PATH,
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> },

          {
            element: <PanelAuthGuard />,
            children: [
              {
                path: "exam",
                children: examRoutes,
              },
              {
                path: "exam-center",
                children: ExamCenterPanelRoutes,
              },
              {
                path: "control",
                children: ControlPanelRoutes,
              },
              {
                path: "student",
                children: StudentPanelRoutes,
              },
              {
                path: "teacher",
                children: teacherPanelRoutes,
              },
              {
                path: "employee",
                children: EmployeePanelRoutes,
              },
              {
                path: "nursing",
                children: NursingPanelRoutes,
              },
              {
                path: "order",
                children: OrderPanelRoutes,
              },
              {
                path: "user",
                children: AdminUserCoreRoutes,
              },
            ],
          },
        ],
      },
    ],
  },

  // 404
  {
    path: "*",
    element: <NotFound />,
  },
]);
