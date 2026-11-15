import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

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
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto gap-4 px-4 py-3 sm:px-4 lg:px-4">
          <Outlet />
        </div>
      </main>
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
