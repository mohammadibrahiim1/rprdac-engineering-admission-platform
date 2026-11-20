import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Search,
  Bell,
  ChevronDown,
  Calendar as CalendarIcon,
  X,
  Check,
  PanelLeft,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/storeHooks";

const MotionDropdownTrigger = motion.create(DropdownMenuTrigger);
const MotionPopoverTrigger = motion.create(PopoverTrigger);

interface AppHeaderProps {
  userName?: string;
  workspaceName?: string;
  avatarUrl?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
  onPeriodChange?: (period: string) => void;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

const TIME_PERIODS = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const CONTROL_BUTTON_CLASS =
  "h-10 rounded-[10px] border border-slate-200/90 bg-white text-[13.5px] font-normal text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300";

export const AppHeader: React.FC<AppHeaderProps> = ({
  workspaceName = "RPRDAC",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  isSidebarOpen = false,
  onToggleSidebar,
  onSearch,
  onPeriodChange,
  onDateRangeChange,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("Last 7 days");
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const { user: authUser } = useAppSelector((state) => state?.auth);

  console.log(authUser);

  // Default range matching the visual format: Feb 04 - Feb 11, 2024
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 1, 4),
    to: new Date(2024, 1, 11),
  });

  const handlePeriodSelect = (period: { label: string; days: number }) => {
    setSelectedPeriod(period.label);
    onPeriodChange?.(period.label);

    const today = new Date();
    const updatedRange: DateRange = {
      from: subDays(today, period.days),
      to: today,
    };
    setDateRange(updatedRange);
    onDateRangeChange?.(updatedRange);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    onDateRangeChange?.(range);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    onSearch?.("");
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "Select date range";
    if (dateRange.to) {
      return `${format(dateRange.from, "MMM dd")} - ${format(
        dateRange.to,
        "MMM dd, yyyy",
      )}`;
    }
    return format(dateRange.from, "MMM dd, yyyy");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full border-b border-slate-200/80 bg-white px-4 py-3.5"
    >
      <div className="mx-auto flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section: Sidebar Toggle + Avatar + Greeting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-3.5">
            {/* Sidebar Open/Close Button (Mobile visible; optional toggle on all screens) */}
            {onToggleSidebar && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onToggleSidebar}
                  aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                  aria-expanded={isSidebarOpen}
                  className="h-10 w-10 shrink-0 rounded-[10px] border-slate-200/90 bg-white text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 hover:text-slate-900 md:hidden"
                >
                  {isSidebarOpen ? (
                    <X className="h-[18px] w-[18px]" strokeWidth={1.85} />
                  ) : (
                    <PanelLeft
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.85}
                    />
                  )}
                </Button>
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Avatar className="h-11 w-11 border border-slate-200/70 bg-slate-100 sm:h-12 sm:w-12">
                <AvatarImage
                  src={authUser?.profilePicture || avatarUrl}
                  alt={authUser?.userName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-slate-100 font-medium text-slate-700">
                  {authUser?.userName?.slice(0, 2)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex flex-col">
              <h1 className="text-[17px] font-medium leading-snug tracking-tight text-slate-900 sm:text-[19px] capitalize">
                Hello {authUser?.userName}
              </h1>
              <p className="flex items-center gap-1.5 text-[13px] leading-snug text-slate-500 sm:text-[14px]">
                <span>Welcome back to {workspaceName}</span>
                <motion.span
                  role="img"
                  aria-label="waving hand"
                  className="inline-block origin-[70%_70%] cursor-default select-none"
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{
                    duration: 1.8,
                    delay: 0.3,
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    rotate: [0, 14, -8, 14, -4, 10, 0],
                    transition: { duration: 1.2 },
                  }}
                >
                  👋
                </motion.span>
              </p>
            </div>
          </div>

          {/* Mobile-only quick action icons (Search & Notifications) */}
          <div className="flex items-center gap-2 lg:hidden">
            <ActionButtons
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              closeSearch={closeSearch}
              unreadNotifications={unreadNotifications}
              setUnreadNotifications={setUnreadNotifications}
              isMobile
            />
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="relative flex items-center pt-1">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search dashboard..."
                  autoFocus
                  className="h-10 w-full rounded-[10px] border-slate-200 pl-9 pr-9 text-sm shadow-xs focus-visible:ring-slate-300"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="absolute right-2.5 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Section: Action Icons + Filters */}
        <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
          {/* Desktop Search & Notification Buttons */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <ActionButtons
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              closeSearch={closeSearch}
              unreadNotifications={unreadNotifications}
              setUnreadNotifications={setUnreadNotifications}
            />
          </div>

          {/* Time Period Dropdown ("Last 7 days") */}
          <DropdownMenu>
            <MotionDropdownTrigger
              type="button"
              whileTap={{ scale: 0.98 }}
              className={cn(
                CONTROL_BUTTON_CLASS,
                "inline-flex flex-1 items-center justify-between gap-2.5 px-3.5 sm:w-auto sm:flex-initial",
              )}
            >
              <span>{selectedPeriod}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
            </MotionDropdownTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl border-slate-200/90 p-1 shadow-md"
            >
              {TIME_PERIODS.map((period) => (
                <DropdownMenuItem
                  key={period.label}
                  onClick={() => handlePeriodSelect(period)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-[13.5px] text-slate-700 focus:bg-slate-100"
                >
                  <span>{period.label}</span>
                  {selectedPeriod === period.label && (
                    <Check className="h-3.5 w-3.5 text-slate-900" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Range Picker ("Feb 04 - Feb 11, 2024") */}
          <Popover>
            <MotionPopoverTrigger
              type="button"
              whileTap={{ scale: 0.98 }}
              className={cn(
                CONTROL_BUTTON_CLASS,
                "inline-flex flex-1 items-center justify-start gap-2.5 px-3.5 sm:w-auto sm:flex-initial",
                !dateRange && "text-slate-500",
              )}
            >
              <CalendarIcon className="h-4 w-4 shrink-0 text-slate-700" />
              <span className="truncate">{formatDateRange()}</span>
            </MotionPopoverTrigger>
            <PopoverContent
              align="end"
              className="w-auto rounded-xl border-slate-200/90 p-0 shadow-lg"
            >
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={1}
                className="rounded-xl"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.header>
  );
};

/* Sub-component for Search & Bell buttons to keep desktop/mobile layouts clean */
interface ActionButtonsProps {
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  closeSearch: () => void;
  unreadNotifications: number;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;
  isMobile?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  handleSearchChange,
  closeSearch,
  unreadNotifications,
  setUnreadNotifications,
  isMobile = false,
}) => {
  return (
    <>
      {/* Desktop Expandable Search */}
      {!isMobile ? (
        <div className="flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            {isSearchOpen ? (
              <motion.div
                key="search-input"
                initial={{ width: 40, opacity: 0.5 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative flex items-center"
              >
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  autoFocus
                  className="h-10 w-full rounded-[10px] border-slate-200/90 bg-white pl-9 pr-8 text-[13.5px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus-visible:ring-slate-300"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="absolute right-2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="search-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open search"
                  className="h-10 w-10 rounded-[10px] border-slate-200/90 bg-white text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50 hover:text-slate-900"
                >
                  <Search className="h-[18px] w-[18px]" strokeWidth={1.85} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Mobile Search Toggle Button */
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label="Toggle search"
            className="h-10 w-10 rounded-[10px] border-slate-200/90 bg-white text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-slate-50"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.85} />
          </Button>
        </motion.div>
      )}

      {/* Notification Bell Popover */}
      <Popover>
        <MotionPopoverTrigger
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Notifications"
          className={cn(
            CONTROL_BUTTON_CLASS,
            "relative inline-flex h-10 w-10 items-center justify-center text-slate-700",
          )}
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.85} />
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </MotionPopoverTrigger>
        <PopoverContent
          align="end"
          className="w-72 rounded-xl border-slate-200/90 p-3 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-sm font-medium text-slate-900">
              Notifications
            </span>
            {unreadNotifications > 0 && (
              <button
                type="button"
                onClick={() => setUnreadNotifications(0)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="space-y-2 py-2 text-xs text-slate-600">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <p className="font-medium text-slate-800">Weekly Report Ready</p>
              <p className="mt-0.5 text-slate-500">
                Grandview analytics for Feb 04 – Feb 11 are now available.
              </p>
            </div>
            <div className="rounded-lg p-2.5 hover:bg-slate-50">
              <p className="font-medium text-slate-800">Team Member Joined</p>
              <p className="mt-0.5 text-slate-500">
                Alex Rivera accepted your workspace invite.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default AppHeader;
