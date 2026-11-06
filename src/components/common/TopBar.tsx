import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { pageTitles } from "../../config/navigationConfig";

import { logout } from "@/features/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";

interface TopBarProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
}

const TopBar = ({
  onMenuClick,
  onSidebarToggle,
  isSidebarOpen,
}: TopBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // রিডাক্স থেকে ইউজার স্টেট আনা
  const { user } = useAppSelector((state) => state.auth);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const pageTitle = pageTitles[location?.pathname] || "Exam Management";

  // লগআউট হ্যান্ডলার
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      setProfileOpen(false);
      navigate("/login"); // লগআউটের পর লগইন পেজে রিডাইরেক্ট
    } catch (error) {
      // ফেইল করলেও লোকাল স্টেট পরিষ্কার করে লগইন পেজে পাঠানো নিরাপদ
      navigate("/login");
    }
  };

  return (
    <header className="relative z-20 flex h-19 shrink-0 items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-white via-slate-50/50 to-white px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-7">
      {/* LEFT SECTION */}
      <div className="flex min-w-0 items-center gap-3">
        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-gradient-to-r hover:from-slate-100 hover:to-indigo-50/30 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        {/* DESKTOP SIDEBAR TOGGLE */}
        <button
          onClick={onSidebarToggle}
          className="hidden rounded-xl p-2 text-slate-500 transition hover:bg-gradient-to-r hover:from-slate-100 hover:to-indigo-50/30 lg:block"
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
            <span className="text-indigo-600 font-semibold">
              Exam Management
            </span>
          </div>

          <h2 className="truncate text-base font-bold bg-gradient-to-r from-slate-800 to-indigo-950 bg-clip-text text-transparent sm:mt-1 sm:text-lg">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* SEARCH */}
        <button
          className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/85 px-3 text-xs font-medium text-slate-400 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 md:flex"
          aria-label="Search"
        >
          <Search size={16} />
          <span>Quick Search</span>
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
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
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-indigo-50/50 hover:text-indigo-600"
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 animate-pulse" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-12 z-50 w-70 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:w-80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Notifications
                </h3>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
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

        <div className="h-8 w-px bg-slate-200/80" />

        {/* PROFILE SECTION */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-indigo-50/40 sm:gap-3"
            aria-expanded={profileOpen}
          >
            {/* User Avatar / Fallback Icon */}
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm shadow-indigo-500/25">
                <UserIcon size={18} />
              </div>
            )}

            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-slate-800">
                {user?.userName || "Administrator"}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                {user?.phone || user?.role || "Super Admin"}
              </p>
            </div>

            <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-md">
              <div className="border-b border-slate-100 px-3 py-3 bg-gradient-to-r from-slate-50 to-indigo-50/20 rounded-xl mb-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.userName || "Administrator"}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500 truncate">
                  {user?.phone || "Exam Management Panel"}
                </p>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-indigo-50/50 hover:text-indigo-600"
              >
                <UserIcon size={16} />
                My Profile
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-indigo-50/50 hover:text-indigo-600"
              >
                <Settings size={16} />
                Settings
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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

export default TopBar;
