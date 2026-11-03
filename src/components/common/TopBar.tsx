import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { pageTitles } from "../../config/routeConfig";

interface TopBarProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
}

const TopBar = ({ onMenuClick, onSidebarToggle, isSidebarOpen }) => {
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const pageTitle = pageTitles[location?.pathname] || "Exam Management";

  return (
    <header className="relative z-20 flex h-19 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-7">
      {/* LEFT SECTION */}
      <div className="flex min-w-0 items-center gap-3">
        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        {/* DESKTOP SIDEBAR TOGGLE */}
        <button
          onClick={onSidebarToggle}
          className="hidden rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 lg:block"
          aria-label="Toggle navigation"
        >
          {isSidebarOpen ? (
            <PanelLeftClose size={20} />
          ) : (
            <PanelLeftOpen size={20} />
          )}
        </button>

        <div className="min-w-0">
          <div className="hidden items-center gap-2 text-[11px] font-medium text-slate-400 sm:flex">
            <span>RPRDAC</span>
            <span>/</span>
            <span>Exam Management</span>
          </div>

          <h2 className="truncate text-base font-bold text-slate-800 sm:mt-1 sm:text-lg">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* SEARCH */}
        <button
          className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-400 transition hover:border-blue-300 hover:text-blue-600 md:flex"
          aria-label="Search"
        >
          <Search size={16} />
          <span>Quick Search</span>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
            Ctrl K
          </kbd>
        </button>

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-12 z-50 w-70 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:w-80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Notifications
                </h3>
                <span className="text-[10px] font-semibold text-blue-600">
                  Recent
                </span>
              </div>
              <div className="py-7 text-center">
                <Bell size={25} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">
                  No new notifications
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  You're all caught up!
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50 sm:gap-3"
            aria-expanded={profileOpen}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <User size={19} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-slate-800">Administrator</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Super Admin</p>
            </div>

            <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="text-xs font-bold text-slate-800">
                  Administrator
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Exam Management Panel
                </p>
              </div>

              <button
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <User size={16} />
                My Profile
              </button>

              <button
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Settings size={16} />
                Settings
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar; // (অথবা export default TopBar;)
