import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

const MainLayoutContent: React.FC = () => {
  const location = useLocation();
  const { openMobile, setOpenMobile, toggleSidebar } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  return (
    <div className="flex min-h-screen w-full max-w-full bg-[#F5F8FB]">
      {/* Left Sidebar: Desktop-e fixed, Mobile-e Sheet drawer */}
      <AppSidebar />

      {/* Right Column: Fixed/Sticky Header + Scrollable Outlet (gap-1 from sidebar on desktop) */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-1">
        {/* Fixed / Sticky Top AppHeader */}
        <header className="sticky top-0 z-30 w-full shrink-0 bg-white">
          <AppHeader
            userName="Kim"
            workspaceName="Grandview"
            isSidebarOpen={openMobile}
            onToggleSidebar={toggleSidebar}
            onSearch={(q) => console.log("Search:", q)}
            onPeriodChange={(period) => console.log("Period:", period)}
            onDateRangeChange={(range) => console.log("Date Range:", range)}
          />
        </header>

        {/* Outlet Area: pt-1 = gap-1 from AppHeader, niche kono gap nei */}
        <main className="min-w-0 flex-1 pt-1">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export const MainLayout: React.FC = () => {
  return (
    <SidebarProvider
      defaultOpen={true}
      className="min-h-screen w-full max-w-full"
    >
      <MainLayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;
