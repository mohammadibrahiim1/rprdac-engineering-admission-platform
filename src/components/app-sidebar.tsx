import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MoreHorizontal, TerminalIcon } from "lucide-react";
import { sidebarData } from "@/config/navigationConfig";
import { useAppSelector } from "@/hooks/storeHooks";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

/* -------------------------------------------------------------------------- */
/*                             Multi-Panel Themes                             */
/* -------------------------------------------------------------------------- */

const PANEL_THEMES: Record<
  string,
  { activeBg: string; activeText: string; dotBg: string; iconBg: string }
> = {
  exam: {
    activeBg: "bg-indigo-500/10",
    activeText: "text-indigo-600",
    dotBg: "bg-indigo-600",
    iconBg: "bg-indigo-500/10 text-indigo-600",
  },
  student: {
    activeBg: "bg-blue-500/10",
    activeText: "text-blue-600",
    dotBg: "bg-blue-600",
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  teacher: {
    activeBg: "bg-emerald-500/10",
    activeText: "text-emerald-600",
    dotBg: "bg-emerald-600",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  employee: {
    activeBg: "bg-amber-500/10",
    activeText: "text-amber-600",
    dotBg: "bg-amber-600",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  nursing: {
    activeBg: "bg-rose-500/10",
    activeText: "text-rose-600",
    dotBg: "bg-rose-600",
    iconBg: "bg-rose-500/10 text-rose-600",
  },
  announcement: {
    activeBg: "bg-violet-500/10",
    activeText: "text-violet-600",
    dotBg: "bg-violet-600",
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  user: {
    activeBg: "bg-cyan-500/10",
    activeText: "text-cyan-600",
    dotBg: "bg-cyan-600",
    iconBg: "bg-cyan-500/10 text-cyan-600",
  },
  order: {
    activeBg: "bg-sky-500/10",
    activeText: "text-sky-600",
    dotBg: "bg-sky-600",
    iconBg: "bg-sky-500/10 text-sky-600",
  },
  examcenter: {
    activeBg: "bg-teal-500/10",
    activeText: "text-teal-600",
    dotBg: "bg-teal-600",
    iconBg: "bg-teal-500/10 text-teal-600",
  },
  control: {
    activeBg: "bg-orange-500/10",
    activeText: "text-orange-600",
    dotBg: "bg-orange-600",
    iconBg: "bg-orange-500/10 text-orange-600",
  },
  account: {
    activeBg: "bg-purple-500/10",
    activeText: "text-purple-600",
    dotBg: "bg-purple-600",
    iconBg: "bg-purple-500/10 text-purple-600",
  },
  default: {
    activeBg: "bg-slate-900/10",
    activeText: "text-slate-900",
    dotBg: "bg-slate-900",
    iconBg: "bg-slate-900/10 text-slate-900",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
    {},
  );
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const user = {
    name: authUser?.userName || "Administrator",
    phone: authUser?.phone || "017653XXXXX",
    avatar: authUser?.profilePicture || "",
  };

  // Safe Icon Renderer (Handles both Component Reference & JSX Element)
  const renderIcon = (
    IconComponent?: React.ElementType | React.ReactNode,
    className = "h-4 w-4",
  ) => {
    if (!IconComponent) return null;
    if (React.isValidElement(IconComponent)) return IconComponent;
    const Icon = IconComponent as React.ElementType;
    return <Icon className={className} />;
  };

  // Close active mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setActiveMobileMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isRouteActive = (path?: string) => {
    if (!path || path === "#") return false;
    return location?.pathname?.toLowerCase()?.includes(path.toLowerCase());
  };

  const togglePanel = (panelName: string) => {
    setExpandedPanels((prev) => ({ ...prev, [panelName]: !prev[panelName] }));
  };

  // Sub Navigation Link Renderer
  const SubNavLink = ({ sub, theme }: { sub: any; theme: any }) => {
    const active = isRouteActive(sub.url || sub.path);
    return (
      <Link
        to={sub.url || sub.path}
        className={`flex items-center gap-3 py-2 px-4 ml-6 my-1 rounded text-[13px] font-medium transition-all duration-200 group relative ${
          active
            ? `${theme.activeText} font-semibold ${theme.activeBg} shadow-sm`
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
        }`}
      >
        {active && (
          <motion.div
            layoutId="activeDot"
            className={`absolute left-2 w-1.5 h-5 rounded-full ${theme.dotBg}`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        {sub.icon && (
          <span
            className={`shrink-0 transition-colors ${
              active
                ? theme.activeText
                : "text-slate-400 group-hover:text-slate-600"
            }`}
          >
            {renderIcon(sub.icon, "h-4 w-4")}
          </span>
        )}
        <span className="truncate">{sub.title || sub.name}</span>
      </Link>
    );
  };

  // Render Section Items (MainNav, Secondary, Projects, Workspaces) with Accordion
  const renderNavItem = (item: any, themeKey = "default") => {
    const theme = PANEL_THEMES[themeKey] || PANEL_THEMES.default;
    const hasSubItems = item?.items && item.items.length > 0;
    const isChildActive = hasSubItems
      ? item.items.some((sr: any) => isRouteActive(sr.url || sr.path))
      : isRouteActive(item.url);
    const isCurrentExpanded =
      expandedPanels[item.title || item.name] ?? isChildActive;

    if (!hasSubItems) {
      return (
        <Link
          key={item.title || item.name}
          to={item.url || "#"}
          className={`flex items-center gap-3 p-2.5 rounded mb-1 group transition-all duration-200 ${
            isChildActive
              ? `${theme.activeBg} ${theme.activeText} shadow-sm font-semibold`
              : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          <div
            className={`p-1.5 rounded-lg shrink-0 transition-colors ${
              isChildActive
                ? theme.iconBg
                : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
            }`}
          >
            {renderIcon(item.icon, "h-4 w-4")}
          </div>
          {isExpanded && (
            <span className="text-[13px] font-semibold truncate">
              {item.title || item.name}
            </span>
          )}
        </Link>
      );
    }

    return (
      <div key={item.title || item.name} className="mb-1">
        <button
          type="button"
          onClick={() => togglePanel(item.title || item.name)}
          className={`flex items-center justify-between w-full p-2.5 rounded transition-all duration-200 group ${
            isChildActive
              ? `${theme.activeBg} ${theme.activeText} shadow-sm`
              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                isChildActive
                  ? theme.iconBg
                  : "bg-slate-100 text-slate-500 group-hover:text-slate-700"
              }`}
            >
              {renderIcon(item.icon, "h-4 w-4")}
            </div>
            {isExpanded && (
              <span
                className={`text-[13px] font-semibold truncate ${
                  isChildActive
                    ? "text-slate-900 font-bold"
                    : "text-slate-600 group-hover:text-slate-900"
                }`}
              >
                {item.title || item.name}
              </span>
            )}
          </div>
          {isExpanded && (
            <ChevronRight
              className={`h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out ${
                isCurrentExpanded ? "rotate-90" : ""
              }`}
            />
          )}
        </button>

        <AnimatePresence initial={false}>
          {isCurrentExpanded && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-0.5 pb-1">
                {item?.items?.map((sub: any) => (
                  <SubNavLink
                    key={sub.key || sub.url || sub.path}
                    sub={sub}
                    theme={theme}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* ─── DESKTOP SIDEBAR VIEW ─── */}
      <Sidebar
        variant="inset"
        {...props}
        className="hidden lg:flex border-r border-slate-200/80 bg-white z-40 shadow-sm"
      >
        <SidebarHeader className="border-b border-slate-100 px-5 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link to="/" />}>
                <div className="flex aspect-square size-10 items-center justify-center rounded bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                  <TerminalIcon className="size-5" />
                </div>
                {isExpanded && (
                  <div className="grid flex-1 text-left leading-tight pl-1">
                    <span className="truncate font-extrabold text-sm text-slate-900">
                      RPRDAC Admin
                    </span>
                    <span className="truncate text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      Control Center
                    </span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {/* 1. Main Navigation */}
          {sidebarData?.navMain?.length > 0 && (
            <div>
              {isExpanded && (
                <p className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">
                  Main Menus
                </p>
              )}
              {sidebarData.navMain.map((item: any, idx: number) => {
                const themesList = [
                  "exam",
                  "student",
                  "teacher",
                  "employee",
                  "nursing",
                  "control",
                ];
                const chosenTheme = themesList[idx % themesList.length];
                return renderNavItem(item, chosenTheme);
              })}
            </div>
          )}

          {/* 2. Secondary Navigation */}
          {sidebarData?.navSecondary?.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              {isExpanded && (
                <p className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">
                  Secondary Modules
                </p>
              )}
              {sidebarData?.navSecondary?.map((item: any, idx: number) => {
                const themesList = [
                  "announcement",
                  "user",
                  "order",
                  "examcenter",
                  "default",
                ];
                const chosenTheme = themesList[idx % themesList.length];
                return renderNavItem(item, chosenTheme);
              })}
            </div>
          )}

          {/* 3. Projects */}
          {sidebarData?.projects?.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              {isExpanded && (
                <p className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">
                  Projects
                </p>
              )}
              {sidebarData.projects.map((proj: any) => {
                const active = isRouteActive(proj.url);
                const theme = PANEL_THEMES.control;
                return (
                  <Link
                    key={proj.name}
                    to={proj.url || "#"}
                    className={`flex items-center gap-3 p-2.5 rounded mb-1 group transition-all duration-200 ${
                      active
                        ? `${theme.activeBg} ${theme.activeText} shadow-sm font-semibold`
                        : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded shrink-0 ${
                        active
                          ? theme.iconBg
                          : "bg-orange-500/10 text-orange-600"
                      }`}
                    >
                      {renderIcon(proj.icon, "h-4 w-4")}
                    </div>
                    {isExpanded && (
                      <span className="text-[13px] font-semibold truncate">
                        {proj.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* 4. Workspaces */}
          {sidebarData?.workspaces?.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              {isExpanded && (
                <p className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">
                  Workspaces & Access
                </p>
              )}
              {sidebarData.workspaces.map((ws: any) => {
                const active = isRouteActive(ws.url);
                const theme = PANEL_THEMES.account;
                return (
                  <Link
                    key={ws.name}
                    to={ws.url || "#"}
                    className={`flex items-center gap-3 p-2.5 rounded mb-1 group transition-all duration-200 ${
                      active
                        ? `${theme.activeBg} ${theme.activeText} shadow-sm font-semibold`
                        : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded shrink-0 ${
                        active
                          ? theme.iconBg
                          : "bg-purple-500/10 text-purple-600"
                      }`}
                    >
                      {renderIcon(ws.icon, "h-4 w-4")}
                    </div>
                    {isExpanded && (
                      <span className="text-[13px] font-semibold truncate">
                        {ws.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-100 p-3">
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>

      {/* ─── MOBILE & TABLET BOTTOM NAVBAR VIEW ─── */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] z-50 flex lg:hidden items-center justify-around px-2 selection:bg-transparent">
        {/* Render first 3 main items */}
        {sidebarData?.navMain?.slice(0, 3)?.map((item: any, idx: number) => {
          const themesList = ["exam", "student", "teacher"];
          const theme =
            PANEL_THEMES[themesList[idx % themesList.length]] ||
            PANEL_THEMES.default;
          const isChildActive = item?.items?.some((sr: any) =>
            isRouteActive(sr.url || sr.path),
          );

          return (
            <button
              type="button"
              key={item.title || item.name}
              onClick={() =>
                setActiveMobileMenu(
                  activeMobileMenu === item.title ? null : item.title,
                )
              }
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative ${
                isChildActive
                  ? theme.activeText
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="p-1 rounded-lg">
                {renderIcon(item.icon, "h-4 w-4")}
              </div>
              <span className="text-[10px] font-bold tracking-tight max-w-[72px] truncate">
                {item.title}
              </span>
              {isChildActive && (
                <span
                  className={`absolute top-1.5 right-1/2 translate-x-3 w-1.5 h-1.5 rounded-full ${theme.dotBg}`}
                />
              )}
            </button>
          );
        })}

        {/* More Button */}
        <button
          type="button"
          onClick={() =>
            setActiveMobileMenu(
              activeMobileMenu === "more_options" ? null : "more_options",
            )
          }
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            activeMobileMenu === "more_options"
              ? "text-indigo-600 font-bold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-tight">More</span>
        </button>

        {/* Mobile Popup Drawer */}
        <AnimatePresence>
          {activeMobileMenu && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              className="absolute bottom-20 left-4 right-4 bg-white border border-slate-200/80 rounded-2xl max-h-[70vh] overflow-y-auto shadow-2xl p-4 flex flex-col gap-3 z-50 scrollbar-thin"
            >
              {activeMobileMenu === "more_options" ? (
                <>
                  <div className="px-3 py-1 text-slate-400 font-extrabold text-[11px] uppercase tracking-widest border-b border-slate-100 pb-2">
                    All Management Modules
                  </div>

                  {/* Rest of NavMain */}
                  {sidebarData?.navMain?.slice(3).map((item: any) => (
                    <div
                      key={item.title}
                      className="flex flex-col border-b border-slate-100 pb-2 mb-1"
                    >
                      <div className="flex items-center gap-2 px-3 py-1 font-bold text-xs uppercase tracking-wider text-indigo-600">
                        {renderIcon(item.icon, "h-4 w-4")}
                        <span>{item.title}</span>
                      </div>
                      {item.items?.map((sub: any) => (
                        <Link
                          key={sub.url || sub.path}
                          to={sub.url || sub.path}
                          onClick={() => setActiveMobileMenu(null)}
                          className={`flex items-center gap-3 p-2.5 rounded text-sm font-semibold transition-all ${
                            isRouteActive(sub.url || sub.path)
                              ? "bg-indigo-50 text-indigo-600 font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {sub.icon && (
                            <span className="shrink-0 text-slate-400">
                              {renderIcon(sub.icon, "h-4 w-4")}
                            </span>
                          )}
                          <span className="truncate">
                            {sub.title || sub.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}

                  {/* NavSecondary */}
                  {sidebarData?.navSecondary?.map((secItem: any) => (
                    <div
                      key={secItem.title}
                      className="flex flex-col border-b border-slate-100 pb-2 mb-1"
                    >
                      <div className="flex items-center gap-2 px-3 py-1 font-bold text-xs uppercase tracking-wider text-violet-600">
                        {renderIcon(secItem.icon, "h-4 w-4")}
                        <span>{secItem.title}</span>
                      </div>
                      {secItem.items?.map((sub: any) => (
                        <Link
                          key={sub.url || sub.path}
                          to={sub.url || sub.path}
                          onClick={() => setActiveMobileMenu(null)}
                          className={`flex items-center gap-3 p-2.5 rounded text-sm font-semibold transition-all ${
                            isRouteActive(sub.url || sub.path)
                              ? "bg-violet-50 text-violet-600 font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {sub.icon && (
                            <span className="shrink-0 text-slate-400">
                              {renderIcon(sub.icon, "h-4 w-4")}
                            </span>
                          )}
                          <span className="truncate">
                            {sub.title || sub.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}

                  {/* Projects */}
                  {sidebarData?.projects?.length > 0 && (
                    <div className="flex flex-col border-b border-slate-100 pb-2 mb-1">
                      <div className="px-3 py-1 font-bold text-xs uppercase tracking-wider text-orange-600">
                        Projects
                      </div>
                      {sidebarData.projects.map((proj: any) => (
                        <Link
                          key={proj.name}
                          to={proj.url}
                          onClick={() => setActiveMobileMenu(null)}
                          className="flex items-center gap-3 p-2.5 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {renderIcon(proj.icon, "h-4 w-4")}
                          <span>{proj.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Workspaces */}
                  {sidebarData?.workspaces?.length > 0 && (
                    <div className="flex flex-col">
                      <div className="px-3 py-1 font-bold text-xs uppercase tracking-wider text-purple-600">
                        Workspaces
                      </div>
                      {sidebarData.workspaces.map((ws: any) => (
                        <Link
                          key={ws.name}
                          to={ws.url}
                          onClick={() => setActiveMobileMenu(null)}
                          className="flex items-center gap-3 p-2.5 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {renderIcon(ws.icon, "h-4 w-4")}
                          <span>{ws.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="px-3 py-1 text-slate-400 font-extrabold text-xs uppercase tracking-widest mb-1 border-b border-slate-100 pb-2">
                    {activeMobileMenu} Shortcuts
                  </div>
                  {(() => {
                    const currentMainItem = sidebarData.navMain.find(
                      (item: any) => item.title === activeMobileMenu,
                    );
                    return currentMainItem?.items?.map((sub: any) => (
                      <Link
                        key={sub.url || sub.path}
                        to={sub.url || sub.path}
                        onClick={() => setActiveMobileMenu(null)}
                        className={`flex items-center gap-3 p-2.5 rounded text-sm font-semibold transition-all ${
                          isRouteActive(sub.url || sub.path)
                            ? "bg-indigo-50 text-indigo-600 font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {sub.icon && (
                          <span className="shrink-0">
                            {renderIcon(sub.icon, "h-4 w-4")}
                          </span>
                        )}
                        <span className="truncate">
                          {sub.title || sub.name}
                        </span>
                      </Link>
                    ));
                  })()}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
