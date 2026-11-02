import React from "react";
import { motion } from "framer-motion";
import { Bell, ShieldCheck, User } from "lucide-react";

export interface TopBarProps {
  pageLabel: string;
  isDemoMode?: boolean;
  userInitials?: string;
  onNotificationClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  pageLabel,
  isDemoMode = false,
  userInitials = "AD",
  onNotificationClick,
}) => {
  return (
    <header className="topbar no-print flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm select-none z-20">
      {/* ── Left Breadcrumb Section ── */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          RPR DUET ADMISSION CARE
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-blue-600 font-semibold tracking-wide">
          {pageLabel}
        </span>
      </div>

      {/* ── Right Actions & Status Section ── */}
      <div className="flex items-center gap-4">
        {/* Mode Pill (Demo vs Live API Mode) with Framer Motion Animation */}
        <motion.span
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`px-3 py-1 text-xs font-bold rounded-full tracking-wider shadow-sm uppercase ${
            isDemoMode
              ? "bg-amber-100 text-amber-800 border border-amber-300"
              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
          }`}
        >
          {isDemoMode ? "DEMO MODE" : "LIVE API MODE"}
        </motion.span>

        {/* Optional Notification Bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Avatar Badge */}
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm tracking-wider shadow-md shadow-blue-500/20">
          {userInitials}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
