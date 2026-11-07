// src/layouts/MainLayout.tsx
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

const MainLayoutContent = () => {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  // Route change hole mobile drawer auto close hobe
  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  return (
    <div className="flex min-h-svh w-full bg-slate-100/60">
      {/* Newly generated Shadcn AppSidebar */}
      <AppSidebar />

      {/* Main Content wrapper with Inset behavior */}
      {/* <SidebarInset className="flex min-w-0 flex-1 flex-col bg-slate-50 transition-all duration-200"> */}
      {/* Dynamic Page Outlet */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto">
          <Outlet />
        </div>
      </main>
      {/* </SidebarInset> */}
    </div>
  );
};

export const MainLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <MainLayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;
