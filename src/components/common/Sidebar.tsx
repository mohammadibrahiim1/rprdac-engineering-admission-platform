import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Layers,
  HelpCircle,
  Settings,
} from "lucide-react";

// Nav item-এর জন্য টাইপ ইন্টারফেস
export interface NavItem {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  currentTab: string;
  onTabChange: (id: string) => void;
}

// মক ডাটা বা আপনার নেভিগেশন লিস্ট
const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    hint: "Overview & metrics",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: "students",
    label: "Students",
    hint: "Manage admissions",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "invoices",
    label: "Invoices",
    hint: "Payments & billing",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "batches",
    label: "Batches",
    hint: "Course schedules",
    icon: <Layers className="w-5 h-5" />,
  },
  {
    id: "exams",
    label: "MCQ & Exams",
    hint: "Tests and results",
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    id: "settings",
    label: "Settings",
    hint: "System config",
    icon: <Settings className="w-5 h-5" />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
}) => {
  return (
    <aside className="sidebar no-print flex flex-col w-72 h-screen bg-slate-950 text-slate-300 border-r border-slate-800 select-none">
      {/* ── Brand Logo Section ── */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-900 bg-slate-900/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-xl shadow-lg shadow-blue-500/30">
          R
        </div>
        <div className="flex flex-col">
          <strong className="text-base tracking-wide text-white leading-tight">
            RPR <span className="text-blue-500">DUET</span>
          </strong>
          <small className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase mt-0.5">
            Admission Care
          </small>
        </div>
      </div>

      {/* ── Overline Title ── */}
      <div className="px-6 pt-5 pb-2 text-[10px] font-bold tracking-widest text-slate-300 uppercase">
        MANAGEMENT SYSTEM
      </div>

      {/* ── Navigation Menu ── */}
      <nav
        aria-label="Main menu"
        className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto"
      >
        {NAV_ITEMS.map((n) => {
          const isActive = currentTab === n.id;

          return (
            <button
              key={n.id}
              onClick={() => onTabChange(n.id)}
              className={`relative flex items-center w-full px-4 py-3 rounded-xl text-left transition-colors group ${
                isActive
                  ? "bg-blue-600/10 text-blue-400 font-medium"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              {/* Icon */}
              <span
                className={`mr-3.5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-blue-400" : "text-slate-500"
                }`}
              >
                {n.icon}
              </span>

              {/* Text & Hint */}
              <span className="flex flex-col flex-1 min-w-0">
                <strong
                  className={`text-sm tracking-wide truncate ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-slate-300 font-normal"
                  }`}
                >
                  {n.label}
                </strong>
                <small className="text-[11px] text-slate-500 truncate group-hover:text-slate-400">
                  {n.hint}
                </small>
              </span>

              {/* Framer Motion Active Indicator Dash */}
              {isActive && (
                <motion.span
                  layoutId="activeDash"
                  className="absolute right-0 w-1 h-6 bg-blue-500 rounded-l-full shadow-lg shadow-blue-500/50"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Sidebar Bottom Footer / Pulse Indicator ── */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col gap-1 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          {/* Pulsing Dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Exam Management
        </div>
        <small className="text-[11px] text-slate-500 pl-4 font-mono">
          Version 1.0 (Hybrid Mode)
        </small>
      </div>
    </aside>
  );
};

export default Sidebar;
