import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, TerminalIcon } from "lucide-react";
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
  const [, setActiveMobileMenu] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const userType = authUser?.userType?.toLowerCase() || "";
  const isAdmin = userType === "admin" || userType === "superadmin";

  const allowedPanels = (authUser?.allowedPanels || []).map((p: string) =>
    p.toLowerCase().trim(),
  );
  const allowedRoutes = (authUser?.allowedRoutes || []).map((r: string) =>
    r.toLowerCase().trim(),
  );

  const user = {
    name: authUser?.userName || "Administrator",
    phone: authUser?.phone || "017653XXXXX",
    avatar: authUser?.profilePicture || "",
  };

  const renderIcon = (
    IconComponent?: React.ElementType | React.ReactNode,
    className = "h-4 w-4",
  ) => {
    if (!IconComponent) return null;
    if (React.isValidElement(IconComponent)) return IconComponent;
    const Icon = IconComponent as React.ElementType;
    return <Icon className={className} />;
  };

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

  // Direct Panel Access Verification
  const hasPanelAccess = (item: any) => {
    if (isAdmin) return true;
    const itemTitle = (item.title || item.name || "").toLowerCase().trim();
    const itemKey = (item.routeKey || item.key || "").toLowerCase().trim();

    return allowedPanels.some(
      (panel) =>
        panel === itemTitle || panel === itemKey || itemTitle.includes(panel),
    );
  };

  // Direct Route/Sub-item Access Verification
  const hasRouteAccess = (sub: any) => {
    if (isAdmin) return true;
    const subKey = (sub.routeKey || sub.key || "").toLowerCase().trim();
    const subUrl = (sub.url || sub.path || "").toLowerCase().trim();
    const subTitle = (sub.title || sub.name || "").toLowerCase().trim();

    return allowedRoutes.some(
      (route) =>
        route === subKey ||
        route === subTitle ||
        subUrl.includes(route) ||
        route.includes(subKey),
    );
  };

  const SubNavLink = ({ sub, theme }: { sub: any; theme: any }) => {
    if (!isAdmin && !hasRouteAccess(sub)) return null;
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

  const renderNavItem = (item: any, themeKey = "default") => {
    const hasSubItems = item?.items && item.items.length > 0;

    // Filter sub-items strictly based on allowedRoutes
    const filteredSubItems = hasSubItems
      ? item.items.filter((sub: any) => isAdmin || hasRouteAccess(sub))
      : [];

    const itemHasPanelAccess = hasPanelAccess(item);

    // If the panel itself isn't allowed AND no valid filtered sub-routes remain, hide it
    if (!itemHasPanelAccess && filteredSubItems.length === 0) {
      return null;
    }

    const theme = PANEL_THEMES[themeKey] || PANEL_THEMES.default;

    if (!hasSubItems || filteredSubItems.length === 0) {
      if (!itemHasPanelAccess && !hasRouteAccess(item)) return null;
      const isChildActive = isRouteActive(item.url);
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

    const isChildActive = filteredSubItems.some((sr: any) =>
      isRouteActive(sr.url || sr.path),
    );
    const isCurrentExpanded =
      expandedPanels[item.title || item.name] ?? isChildActive;

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
                {filteredSubItems.map((sub: any) => (
                  <SubNavLink
                    key={sub.routeKey || sub.url || sub.path}
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

  const renderNavSection = (
    items: any[],
    sectionTitle: string,
    themesList: string[],
  ) => {
    const renderedItems = items
      .map((item, idx) => {
        const chosenTheme = themesList[idx % themesList.length];
        return renderNavItem(item, chosenTheme);
      })
      .filter(Boolean);

    if (renderedItems.length === 0) return null;

    return (
      <div className="pt-4 first:pt-0 border-t first:border-t-0 border-slate-100">
        {isExpanded && sectionTitle && (
          <p className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">
            {sectionTitle}
          </p>
        )}
        {renderedItems}
      </div>
    );
  };

  return (
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
        {renderNavSection(sidebarData?.navMain || [], "Main Menus", [
          "exam",
          "exam",
          "student",
          "teacher",
          "employee",
          "nursing",
        ])}

        {renderNavSection(
          sidebarData?.navSecondary || [],
          "Secondary Modules",
          ["announcement", "user", "order", "examcenter"],
        )}

        {isAdmin && sidebarData?.projects?.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            {isExpanded && (
              <p className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-sans">
                Control Panel (Projects)
              </p>
            )}
            {sidebarData.projects.map((proj: any) => {
              const active = isRouteActive(proj.url);
              const theme = PANEL_THEMES.control;
              return (
                <Link
                  key={proj.routeKey || proj.name}
                  to={proj.url || "#"}
                  className={`flex items-center gap-3 p-2.5 rounded mb-1 group transition-all duration-200 ${
                    active
                      ? `${theme.activeBg} ${theme.activeText} shadow-sm font-semibold`
                      : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded shrink-0 ${
                      active ? theme.iconBg : "bg-orange-500/10 text-orange-600"
                    }`}
                  >
                    {renderIcon(proj.icon, "h-4 w-4")}
                  </div>
                  {isExpanded && (
                    <span className="text-[13px] font-semibold truncate">
                      {proj.title || proj.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {isAdmin && sidebarData?.workspaces?.length > 0 && (
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
                  key={ws.routeKey || ws.name}
                  to={ws.url || "#"}
                  className={`flex items-center gap-3 p-2.5 rounded mb-1 group transition-all duration-200 ${
                    active
                      ? `${theme.activeBg} ${theme.activeText} shadow-sm font-semibold`
                      : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded shrink-0 ${
                      active ? theme.iconBg : "bg-purple-500/10 text-purple-600"
                    }`}
                  >
                    {renderIcon(ws.icon, "h-4 w-4")}
                  </div>
                  {isExpanded && (
                    <span className="text-[13px] font-semibold truncate">
                      {ws.title || ws.name}
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
  );
}
