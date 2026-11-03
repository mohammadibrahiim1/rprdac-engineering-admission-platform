import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ChevronLeft, X, BookOpen } from "lucide-react";
import { navigationGroups } from "../../config/routeConfig";

interface SidebarProps {
  isOpen?: boolean;
  isMobile?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const Sidebar = ({
  isOpen = true,
  isMobile = false,
  onToggle,
  onClose,
}: SidebarProps) => {
  return (
    <motion.div
      animate={{ width: isMobile ? 280 : isOpen ? 270 : 80 }}
      transition={{ duration: 0.25 }}
      className={`
        ${isMobile ? "h-full w-70" : "fixed inset-y-0 left-0"}
        z-30 flex flex-col border-r border-slate-200 bg-white
      `}
    >
      {/* LOGO */}
      <div className="flex h-19 shrink-0 items-center justify-between border-b border-slate-100 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <GraduationCap size={23} />
          </div>

          {(isOpen || isMobile) && (
            <div className="min-w-0">
              <h1 className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                RPRDAC
              </h1>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-400">
                Exam Management
              </p>
            </div>
          )}
        </div>

        {isMobile ? (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform ${!isOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {navigationGroups?.map((group) => (
          <div key={group.title}>
            {(isOpen || isMobile) && (
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.6px] text-slate-400">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={isMobile ? onClose : undefined}
                    title={!isOpen && !isMobile ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId={isMobile ? undefined : "sidebar-active"}
                            className="absolute bottom-2 left-0 top-2 w-0.75 rounded-r-full bg-blue-600"
                          />
                        )}

                        <Icon
                          size={19}
                          strokeWidth={isActive ? 2.4 : 1.9}
                          className="shrink-0"
                        />

                        {(isOpen || isMobile) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* SIDEBAR FOOTER */}
      {(isOpen || isMobile) && (
        <div className="shrink-0 border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <BookOpen size={17} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-700">
                RPR DUET Admission Care
              </span>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              Exam & Result Management
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
