// src/routes/ProtectedRoutes.tsx

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useCheckAuth } from "@/hooks/useCheckAuth";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useCheckAuth();

  const location = useLocation();

  // Wait for authentication verification
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <p className="text-sm text-muted-foreground">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated user
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
