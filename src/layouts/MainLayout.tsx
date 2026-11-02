import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X, Bell, User, LogOut, ShieldCheck } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import TopBar from "../components/common/Topbar";

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ── 1. Sidebar Section ── */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* ── 2. Main Content Wrapper ── */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Header / Navbar */}
        <TopBar pageLabel={currentTab} />

        {/* Main Page Content Area (React Router Outlet) */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
