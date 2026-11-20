import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Activity,
  BookOpen,
  Plus,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar as CalendarIcon,
  ArrowUpRight,
  Settings,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MotionCard = motion.create(Card);

interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  badgeText: string;
  badgeSubtext: string;
  badgeVariant: "positive" | "warning";
  iconBg: string;
  iconColor: string;
}

interface EnrollmentBar {
  day: number;
  label?: string;
  value: number; // in thousands (e.g. 2.4 = 2.4k)
  highlighted?: boolean;
}

interface ScheduleDay {
  dayName: string;
  dayNumber: number;
  isSelected?: boolean;
}

interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  barColor: string;
}

interface StudentRow {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarTone: string;
  gradeSection: string;
  status: "Enrolled" | "Pending";
  enrolledDate: string;
}

const STATS_DATA: StatItem[] = [
  {
    id: "students",
    label: "Total students",
    value: "2,408",
    icon: GraduationCap,
    badgeText: "↗ +12.8%",
    badgeSubtext: "vs. last month",
    badgeVariant: "positive",
    iconBg: "bg-sky-50 border border-sky-100",
    iconColor: "text-[#2B82C9]",
  },
  {
    id: "teachers",
    label: "Active teachers",
    value: "186",
    icon: Users,
    badgeText: "↗ +4.2%",
    badgeSubtext: "vs. last month",
    badgeVariant: "positive",
    iconBg: "bg-indigo-50/80 border border-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    id: "attendance",
    label: "Attendance rate",
    value: "94.6%",
    icon: Activity,
    badgeText: "↗ +2.1%",
    badgeSubtext: "vs. last month",
    badgeVariant: "positive",
    iconBg: "bg-emerald-50 border border-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "exams",
    label: "Upcoming exams",
    value: "12",
    icon: BookOpen,
    badgeText: "This week",
    badgeSubtext: "Next: Nov 24",
    badgeVariant: "warning",
    iconBg: "bg-amber-50/90 border border-amber-100",
    iconColor: "text-amber-600",
  },
];

const ENROLLMENT_SERIES: Record<string, EnrollmentBar[]> = {
  "This week": [
    { day: 1, label: "Nov 1", value: 1.58 },
    { day: 2, value: 1.82 },
    { day: 3, value: 1.68 },
    { day: 4, value: 2.01 },
    { day: 5, label: "Nov 5", value: 1.78 },
    { day: 6, value: 2.14 },
    { day: 7, value: 1.89 },
    { day: 8, value: 2.26 },
    { day: 9, value: 1.98 },
    { day: 10, label: "Nov 10", value: 2.1 },
    { day: 11, value: 2.38 },
    { day: 12, value: 2.06 },
    { day: 13, value: 2.28 },
    { day: 14, value: 1.99 },
    { day: 15, label: "Nov 15", value: 2.46 },
    { day: 16, value: 2.18 },
    { day: 17, value: 2.34 },
    { day: 18, value: 2.03 },
    { day: 19, value: 2.49 },
    { day: 20, label: "Nov 20", value: 2.24 },
    { day: 21, value: 2.39 },
    { day: 22, value: 2.09 },
    { day: 23, value: 2.55, highlighted: true },
    { day: 24, label: "Nov 24", value: 2.27 },
  ],
  "Last week": [
    { day: 1, label: "Nov 1", value: 1.42 },
    { day: 2, value: 1.65 },
    { day: 3, value: 1.59 },
    { day: 4, value: 1.84 },
    { day: 5, label: "Nov 5", value: 1.72 },
    { day: 6, value: 1.95 },
    { day: 7, value: 1.81 },
    { day: 8, value: 2.04 },
    { day: 9, value: 1.88 },
    { day: 10, label: "Nov 10", value: 1.97 },
    { day: 11, value: 2.15 },
    { day: 12, value: 1.92 },
    { day: 13, value: 2.09 },
    { day: 14, value: 1.86 },
    { day: 15, label: "Nov 15", value: 2.21 },
    { day: 16, value: 2.01 },
    { day: 17, value: 2.12 },
    { day: 18, value: 1.94 },
    { day: 19, value: 2.24 },
    { day: 20, label: "Nov 20", value: 2.05 },
    { day: 21, value: 2.18 },
    { day: 22, value: 1.96 },
    { day: 23, value: 2.31, highlighted: true },
    { day: 24, label: "Nov 24", value: 2.11 },
  ],
  "This month": [
    { day: 1, label: "Nov 1", value: 1.5 },
    { day: 2, value: 1.75 },
    { day: 3, value: 1.62 },
    { day: 4, value: 1.92 },
    { day: 5, label: "Nov 5", value: 1.8 },
    { day: 6, value: 2.05 },
    { day: 7, value: 1.85 },
    { day: 8, value: 2.18 },
    { day: 9, value: 1.95 },
    { day: 10, label: "Nov 10", value: 2.08 },
    { day: 11, value: 2.3 },
    { day: 12, value: 2.02 },
    { day: 13, value: 2.22 },
    { day: 14, value: 1.94 },
    { day: 15, label: "Nov 15", value: 2.38 },
    { day: 16, value: 2.12 },
    { day: 17, value: 2.29 },
    { day: 18, value: 1.99 },
    { day: 19, value: 2.42 },
    { day: 20, label: "Nov 20", value: 2.19 },
    { day: 21, value: 2.33 },
    { day: 22, value: 2.04 },
    { day: 23, value: 2.48, highlighted: true },
    { day: 24, label: "Nov 24", value: 2.22 },
  ],
};

const WEEK_DAYS: ScheduleDay[] = [
  { dayName: "WED", dayNumber: 18 },
  { dayName: "THU", dayNumber: 19 },
  { dayName: "FRI", dayNumber: 20, isSelected: true },
  { dayName: "SAT", dayNumber: 21 },
  { dayName: "SUN", dayNumber: 22 },
];

const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    id: "ev-1",
    time: "09:00",
    title: "Morning assembly",
    subtitle: "Main auditorium · All grades",
    barColor: "bg-[#2B82C9]",
  },
  {
    id: "ev-2",
    time: "10:30",
    title: "Faculty meeting",
    subtitle: "Conference room · 12 attendees",
    barColor: "bg-violet-500",
  },
  {
    id: "ev-3",
    time: "13:00",
    title: "Science fair review",
    subtitle: "Lab 2 · Grade 10",
    barColor: "bg-amber-500",
  },
];

const RECENT_STUDENTS: StudentRow[] = [
  {
    id: "st-1",
    name: "Amelia Brooks",
    email: "amelia.brooks@rprdac.edu",
    initials: "AB",
    avatarTone: "bg-sky-50 text-[#2B82C9] border-sky-200/80",
    gradeSection: "Grade 10 · Section A",
    status: "Enrolled",
    enrolledDate: "Nov 18, 2026",
  },
  {
    id: "st-2",
    name: "Noah Williams",
    email: "noah.williams@rprdac.edu",
    initials: "NW",
    avatarTone: "bg-indigo-50 text-indigo-600 border-indigo-200/80",
    gradeSection: "Grade 9 · Section B",
    status: "Enrolled",
    enrolledDate: "Nov 17, 2026",
  },
  {
    id: "st-3",
    name: "Sofia Chen",
    email: "sofia.chen@rprdac.edu",
    initials: "SC",
    avatarTone: "bg-amber-50 text-amber-700 border-amber-200/80",
    gradeSection: "Grade 11 · Section A",
    status: "Pending",
    enrolledDate: "Nov 16, 2026",
  },
  {
    id: "st-4",
    name: "Ethan Patel",
    email: "ethan.patel@rprdac.edu",
    initials: "EP",
    avatarTone: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    gradeSection: "Grade 8 · Section C",
    status: "Enrolled",
    enrolledDate: "Nov 15, 2026",
  },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<string>("This week");
  const [selectedDay, setSelectedDay] = useState<number>(20);
  const [hoveredBar, setHoveredBar] = useState<EnrollmentBar | null>(null);

  const bars = useMemo(
    () => ENROLLMENT_SERIES[chartRange] || ENROLLMENT_SERIES["This week"],
    [chartRange],
  );

  // Y-axis covers 1.0k to 2.65k cleanly
  const minAxis = 1.0;
  const maxAxis = 2.65;

  const getBarHeightPercent = (val: number) => {
    const clamped = Math.max(minAxis, Math.min(maxAxis, val));
    return ((clamped - minAxis) / (maxAxis - minAxis)) * 100;
  };

  return (
    <div className="h-dvh w-full bg-[#F5F8FB] px-4 py-5 sm:px-6 lg:px-7">
      <div className="space-y-5">
        {/* Top Greeting & Primary Action */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-[#2B82C9]" />
              <span>FRIDAY, NOVEMBER 20, 2026</span>
            </div>
            <h1 className="mt-1 flex items-center gap-2 text-[24px] font-bold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[26px]">
              <span>Good morning, Jordan</span>
              <motion.span
                role="img"
                aria-label="sparkles"
                className="inline-block select-none"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 4 }}
              >
                ✨
              </motion.span>
            </h1>
            <p className="mt-0.5 text-[13.5px] text-slate-500">
              Here&apos;s what&apos;s happening at your school today.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={() => navigate("/student/add")}
              className="h-10 w-fit gap-2 rounded-[10px] bg-[#2B82C9] px-4 text-[13.5px] font-medium text-white shadow-[0_2px_8px_rgba(43,130,201,0.28)] transition-colors hover:bg-[#2272B4]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              <span>Add new student</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* 4 KPI Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS_DATA.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <MotionCard
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: idx * 0.05,
                  ease: "easeOut",
                }}
                whileHover={{ y: -2 }}
                className="rounded-[14px] border border-slate-200/75 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-[0_6px_18px_rgba(43,130,201,0.08)]"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[13px] font-medium text-slate-500">
                      {item.label}
                    </span>
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
                        item.iconBg,
                      )}
                    >
                      <IconComponent
                        className={cn("h-[18px] w-[18px]", item.iconColor)}
                        strokeWidth={1.9}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-[28px] font-bold leading-none tracking-[-0.025em] text-slate-900 tabular-nums">
                    {item.value}
                  </div>

                  <div className="mt-3.5 flex items-center gap-1.5 text-[12px]">
                    {item.badgeVariant === "positive" ? (
                      <span className="inline-flex items-center rounded-md bg-sky-50 px-1.5 py-0.5 font-semibold text-[#2B82C9]">
                        {item.badgeText}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-600">
                        {item.badgeText}
                      </span>
                    )}
                    <span className="text-slate-400">{item.badgeSubtext}</span>
                  </div>
                </CardContent>
              </MotionCard>
            );
          })}
        </div>

        {/* Middle Row: Student Enrollment Bar Chart (8 cols) + Today's Schedule (4 cols) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Student Enrollment Chart Card */}
          <MotionCard
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-[14px] border border-slate-200/75 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.03)] lg:col-span-8"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-6 pt-5 pb-2">
              <div>
                <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-slate-900">
                  Student enrollment
                </h2>
                <p className="mt-0.5 text-[12.5px] text-slate-400">
                  Enrollment activity over time
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-slate-200/90 bg-white px-2.5 text-[12.5px] font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                >
                  <span>{chartRange}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-36 rounded-xl border-slate-200/90 bg-white p-1 shadow-md"
                >
                  {Object.keys(ENROLLMENT_SERIES).map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => setChartRange(option)}
                      className={cn(
                        "cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium",
                        chartRange === option
                          ? "bg-sky-50 text-[#2B82C9] font-semibold"
                          : "text-slate-700 focus:bg-slate-100",
                      )}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent className="px-6 pt-1 pb-5">
              {/* Summary Metric Row */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[24px] font-bold tracking-[-0.02em] text-slate-900 tabular-nums">
                    {hoveredBar ? `${hoveredBar.value.toFixed(2)}k` : "2,408"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[12px] font-semibold text-[#2B82C9]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>12.8%</span>
                  </span>
                  <span className="text-[12px] text-slate-400">
                    {hoveredBar
                      ? `Nov ${hoveredBar.day}, 2026`
                      : "vs. previous week"}
                  </span>
                </div>
              </div>

              {/* Bar Chart Canvas */}
              <div className="relative flex h-[195px] w-full select-none">
                {/* Y-Axis Labels */}
                <div className="flex w-10 shrink-0 flex-col justify-between pr-2 text-[11px] text-slate-400 tabular-nums">
                  <span>2.5k</span>
                  <span>2.0k</span>
                  <span>1.5k</span>
                  <span>1.0k</span>
                </div>

                {/* Bars + Horizontal Gridlines */}
                <div className="relative flex flex-1 flex-col justify-between">
                  {/* Dashed Horizontal Grid Lines */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
                    <div className="w-full border-b border-dashed border-slate-200/85" />
                    <div className="w-full border-b border-dashed border-slate-200/85" />
                    <div className="w-full border-b border-dashed border-slate-200/85" />
                    <div className="w-full border-b border-slate-200/90" />
                  </div>

                  {/* Bar Columns */}
                  <div className="relative z-10 flex h-full items-end gap-1 sm:gap-1.5">
                    {bars.map((bar, idx) => {
                      const heightPct = getBarHeightPercent(bar.value);
                      const isActive =
                        hoveredBar?.day === bar.day ||
                        (!hoveredBar && bar.highlighted);

                      return (
                        <div
                          key={`${chartRange}-${bar.day}`}
                          onMouseEnter={() => setHoveredBar(bar)}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="group relative flex h-full flex-1 flex-col items-center justify-end"
                        >
                          {/* Hover Tooltip */}
                          {hoveredBar?.day === bar.day && (
                            <div className="pointer-events-none absolute -top-7 z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm">
                              {Math.round(bar.value * 1000).toLocaleString()}
                            </div>
                          )}

                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{
                              duration: 0.45,
                              delay: idx * 0.015,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className={cn(
                              "w-full rounded-t-[5px] transition-colors duration-150",
                              isActive
                                ? "bg-[#2B82C9]"
                                : "bg-[#B6DDF8] group-hover:bg-[#7CC0F0]",
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* X-Axis Date Labels */}
              <div className="mt-2 flex items-center justify-between pl-10 text-[11px] text-slate-400 tabular-nums">
                <span>Nov 1</span>
                <span>Nov 5</span>
                <span>Nov 10</span>
                <span>Nov 15</span>
                <span>Nov 20</span>
                <span>Nov 24</span>
              </div>
            </CardContent>
          </MotionCard>

          {/* Today's Schedule Card */}
          <MotionCard
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="flex flex-col justify-between rounded-[14px] border border-slate-200/75 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.03)] lg:col-span-4"
          >
            <div>
              <CardHeader className="flex flex-row items-start justify-between px-5 pt-5 pb-3">
                <div>
                  <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-slate-900">
                    Today&apos;s schedule
                  </h2>
                  <p className="mt-0.5 text-[12.5px] text-slate-400">
                    Friday, November {selectedDay}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Schedule options"
                  onClick={() => navigate("/schedule")}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </CardHeader>

              <CardContent className="px-5 pb-3">
                {/* Week Strip */}
                <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-4">
                  <button
                    type="button"
                    aria-label="Previous day"
                    onClick={() => setSelectedDay((d) => (d > 18 ? d - 1 : 22))}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {WEEK_DAYS.map((d) => {
                    const active = d.dayNumber === selectedDay;
                    return (
                      <button
                        key={d.dayNumber}
                        type="button"
                        onClick={() => setSelectedDay(d.dayNumber)}
                        className={cn(
                          "flex flex-col items-center rounded-[10px] px-2.5 py-1.5 transition-all",
                          active
                            ? "bg-[#2B82C9] text-white shadow-[0_3px_10px_rgba(43,130,201,0.3)]"
                            : "text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide",
                            active ? "text-white/85" : "text-slate-400",
                          )}
                        >
                          {d.dayName}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 text-[13.5px] font-bold tabular-nums",
                            active ? "text-white" : "text-slate-800",
                          )}
                        >
                          {d.dayNumber}
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    aria-label="Next day"
                    onClick={() => setSelectedDay((d) => (d < 22 ? d + 1 : 18))}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Events Timeline */}
                <div className="mt-3.5 divide-y divide-slate-100">
                  {SCHEDULE_EVENTS.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-start gap-3 py-3 first:pt-1 last:pb-1"
                    >
                      <span className="w-11 shrink-0 pt-0.5 text-[12px] font-medium text-slate-400 tabular-nums">
                        {ev.time}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 h-8 w-[3px] shrink-0 rounded-full",
                          ev.barColor,
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-slate-800">
                          {ev.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] text-slate-400">
                          {ev.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>

            {/* Footer Link */}
            <div className="border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => navigate("/calendar")}
                className="flex w-full items-center justify-between text-[12.5px] font-medium text-[#2B82C9] transition-colors hover:text-[#2272B4]"
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>View full calendar</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </MotionCard>
        </div>

        {/* Bottom Row: Recently Added Students Table */}
        <MotionCard
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="rounded-[14px] border border-slate-200/75 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
        >
          <CardHeader className="flex flex-col justify-between gap-3 px-6 pt-5 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-slate-900">
                Recently added students
              </h2>
              <p className="mt-0.5 text-[12.5px] text-slate-400">
                Your latest student enrollments
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/student/students")}
              className="h-8.5 w-fit gap-1.5 rounded-[8px] border-slate-200/90 bg-white px-3 text-[12.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900"
            >
              <span>View all students</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
            </Button>
          </CardHeader>

          <CardContent className="px-0 pb-2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                    <th className="py-2.5 pl-6 pr-4">STUDENT</th>
                    <th className="px-4 py-2.5">GRADE &amp; SECTION</th>
                    <th className="px-4 py-2.5">STATUS</th>
                    <th className="px-4 py-2.5">ENROLLED</th>
                    <th className="py-2.5 pl-4 pr-6 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px]">
                  {RECENT_STUDENTS.map((student) => (
                    <tr
                      key={student.id}
                      className="transition-colors hover:bg-sky-50/35"
                    >
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-transparent">
                            <AvatarFallback
                              className={cn(
                                "text-[11px] font-semibold",
                                student.avatarTone,
                              )}
                            >
                              {student.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {student.name}
                            </p>
                            <p className="truncate text-[11.5px] text-slate-400">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {student.gradeSection}
                      </td>

                      <td className="px-4 py-3.5">
                        {student.status === "Enrolled" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11.5px] font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Enrolled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11.5px] font-medium text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 tabular-nums">
                        {student.enrolledDate}
                      </td>

                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <button
                          type="button"
                          aria-label={`Actions for ${student.name}`}
                          onClick={() => navigate(`/student/${student.id}`)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="mt-2 flex flex-col items-start justify-between gap-2 border-t border-slate-100 px-6 pt-3.5 pb-3 text-[12px] sm:flex-row sm:items-center">
              <p className="text-slate-400 tabular-nums">
                Showing <span className="font-semibold text-slate-600">4</span>{" "}
                of <span className="font-semibold text-slate-600">2,408</span>{" "}
                students
              </p>

              <button
                type="button"
                onClick={() => navigate("/student/students")}
                className="inline-flex items-center gap-1 font-medium text-[#2B82C9] transition-colors hover:text-[#2272B4]"
              >
                <span>See all students</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardContent>
        </MotionCard>

        {/* Bottom Status Bar */}
        <footer className="flex flex-col items-center justify-between gap-2 pt-1 pb-2 text-[11.5px] text-slate-400 sm:flex-row">
          <span>© 2026 RPRDAC Academy</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-600/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </span>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-slate-600"
          >
            <Settings className="h-3 w-3" />
            <span>Settings</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
