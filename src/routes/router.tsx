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

const DASHBOARD_PATH = "/dashboard";

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <Navigate to="/login" replace />,
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
            path: "exam",
            children: examRoutes,
          },

          {
            path: "control",
            children: ControlPanelRoutes,
          },
          // {
          //   path: "student",
          //   children: StudentPanelRoutes,
          // },
        ],
      },
    ],
  },

  // 404
  {
    path: "*",
    element: <div>404 Page Not Found</div>,
  },
]);
