import React from "react";
import { motion, Variants } from "framer-motion";
import {
  Calendar,
  Activity,
  Clock,
  LucideIcon,
  Calendar1,
  Plus,
} from "lucide-react";
import { AdmissionTimelineItem } from "../timeline-types/Timeline.types";

// ==========================================
// Types & Interfaces
// ==========================================
export interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accentClasses: string;
}

export interface TimelineHeaderProps {
  timelines?: AdmissionTimelineItem[];
  handleOpenCreate: () => void;
  isModalOpen?: boolean; // Included to maintain full compatibility if passed from parent
}

// ==========================================
// Sub-component: StatCard
// ==========================================
const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  accentClasses,
}) => (
  <div
    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-medium shadow-2xs transition-all ${accentClasses}`}
  >
    <Icon className="w-4 h-4 opacity-80" />
    <div className="flex flex-col">
      <span className="text-sm font-bold leading-none">{value}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">
        {label}
      </span>
    </div>
  </div>
);

// ==========================================
// Main Component: TimelineHeader
// ==========================================
const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  timelines = [],
  handleOpenCreate,
}) => {
  // Stat calculations with robust null/undefined safety guards
  const totalCount = timelines?.length || 0;
  const activeCount =
    timelines?.filter(
      (t: any) =>
        t?.application?.isActive ||
        t?.admissionTest?.isActive ||
        t?.officeHour?.isActive,
    ).length || 0;

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full">
      {/* Cover Graphic Strip with Warm/Yellow Aura */}
      <div className="relative w-full h-44 bg-gradient-to-r from-[#DDE6ED] via-[#9DB2BF] to-[#DDE6ED] border-b border-[#DDE6ED] overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#27374D_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute right-24 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent blur-2xl"></div>
      </div>

      {/* ─── Header with Gradient Title ─── */}
      <motion.header
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="border-b border-[#E8E8E5] px-5 sm:px-6 py-6 sm:py-8 bg-[#FDFDFD]"
      >
        <div className="flex flex-col gap-6 -mt-20 relative z-10 lg:flex-row lg:items-end lg:justify-between">
          {/* Left Side: Logo/Icon, Title & Description */}
          <div className="flex flex-col sm:items-start gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.05,
                type: "spring",
                stiffness: 200,
                damping: 18,
              }}
              className="inline-flex items-center justify-center w-22 h-22 rounded-xl bg-white border border-amber-200/80 shadow-md p-5 text-4xl text-amber-600 select-none"
            >
              <Calendar1 className="w-auto h-auto" />
            </motion.div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-2xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-[#27374D] via-[#526D82] to-[#9DB2BF] bg-clip-text text-transparent">
                  Admission Timelines
                </span>
              </h1>

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7A7A75] font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{" "}
                  Live Admission Controller
                </span>
                <span className="hidden sm:inline text-[#E8E8E5]">|</span>
                <span className="flex items-center gap-1">
                  Session Dates & Active Banners
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-[#8A8A80] max-w-xl leading-relaxed pt-0.5">
                Manage your admission sessions, application deadlines, exam
                schedules, and active banner displays. Easily customize
                schedules and ensure students get real-time application updates.
              </p>
            </div>
          </div>

          {/* Right Side: Action Button & Stat Cards Component */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3.5 self-start lg:self-end w-full lg:w-auto">
            {/* Create Button */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#27374D] to-[#526D82] hover:from-[#526D82] hover:to-[#27374D] text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Timeline</span>
            </button>

            {/* Stat Cards */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pb-0.5">
              <StatCard
                icon={Calendar}
                value={totalCount}
                label="Total Sessions"
                accentClasses="bg-[#F5F5F3] text-[#3D3D3A] border-[#E8E8E5]"
              />
              <StatCard
                icon={Activity}
                value={activeCount}
                label="Active Display"
                accentClasses="bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
              />
              <StatCard
                icon={Clock}
                value="2026-27"
                label="Current Year"
                accentClasses="bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]"
              />
            </div>
          </div>
        </div>
      </motion.header>
    </div>
  );
};

export default TimelineHeader;
