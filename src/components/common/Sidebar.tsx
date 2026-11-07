import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ChevronLeft, X, BookOpen } from "lucide-react";
import { navigationGroups } from "../../config/navigationConfig";
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

interface SidebarProps {
  isOpen?: boolean;
  isMobile?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const isOpen = state === "expanded";

  return (
    <ShadcnSidebar
      collapsible="icon"
      className="border-r border-slate-200/80 bg-white"
    >
      {/* HEADER / LOGO */}
      <SidebarHeader className="flex h-19 shrink-0 flex-row items-center justify-between border-b border-slate-100 px-5 py-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25">
            <GraduationCap size={22} className="drop-shadow-sm" />
          </div>

          {(isOpen || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <h1 className="truncate text-sm font-black tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                RPRDAC
              </h1>
              <p className="truncate text-[9px] font-bold uppercase tracking-[1.8px] text-indigo-600">
                Exam Management
              </p>
            </motion.div>
          )}
        </div>

        {isMobile ? (
          <button
            onClick={() => setOpenMobile(false)}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${
                !isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </SidebarHeader>

      {/* NAVIGATION CONTENT */}
      <SidebarContent className="space-y-6 px-3 py-6">
        {navigationGroups?.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {(isOpen || isMobile) && (
              <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[1.8px] text-slate-400">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group?.items?.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={() => isMobile && setOpenMobile(false)}
                    title={!isOpen && !isMobile ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white text-indigo-700 shadow-sm shadow-indigo-100/50"
                          : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId={
                              isMobile ? undefined : "sidebar-active-indicator"
                            }
                            className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-gradient-to-b from-blue-600 to-indigo-600 shadow-sm shadow-indigo-500"
                          />
                        )}

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                              : "text-slate-400 group-hover:bg-slate-100 group-hover:text-indigo-600"
                          }`}
                        >
                          <Icon size={17} strokeWidth={isActive ? 2.3 : 1.9} />
                        </div>

                        {(isOpen || isMobile) && (
                          <span className="truncate tracking-tight">
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </SidebarContent>

      {/* SIDEBAR FOOTER */}
      {(isOpen || isMobile) && (
        <SidebarFooter className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30 p-3.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-bold">
                <BookOpen size={16} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-slate-800 leading-tight">
                  RPR Admission Care
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Exam & Result System
                </span>
              </div>
            </div>
          </div>
        </SidebarFooter>
      )}
    </ShadcnSidebar>
  );
};

export default Sidebar;
