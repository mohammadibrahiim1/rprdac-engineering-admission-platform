// src/routes/router.tsx

import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import { LoginForm } from "@/features/auth/pages/LoginForm";
import { ProtectedRoute } from "./ProtectedRoutes";
import { examRoutes } from "./examManagementRoutes";

import { Unauthorized } from "@/components/common/Unauthorized";
import { Welcome } from "@/components/common/Welcome";
import { Dashboard } from "@/components/common/Dashboard";

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
        element: <MainLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },

          {
            path: "exam",
            children: examRoutes,
          },

          {
            path: "control/settings",
            element: <div>System Control Settings</div>,
          },
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
