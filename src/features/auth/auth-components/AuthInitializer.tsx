// src/components/common/AuthInitializer.tsx

import React, { useEffect, useRef } from "react";

import { loadCurrentUser } from "@/features/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch();

  const { authChecked } = useAppSelector((state) => state.auth);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    const initializeAuth = async () => {
      try {
        await dispatch(loadCurrentUser()).unwrap();
      } catch (error) {
        console.info("No active session found.");
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Wait until backend session verification completes
  if (!authChecked) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <p className="text-sm font-medium text-muted-foreground">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthInitializer;
