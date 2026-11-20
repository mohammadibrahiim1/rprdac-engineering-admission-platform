import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Command, LifeBuoy } from "lucide-react";
import { sidebarData } from "@/config/navigationConfig";
import { useAppSelector } from "@/hooks/storeHooks";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavUser } from "@/components/nav-user";
import { cn } from "@/lib/utils";

const MotionDropdownTrigger = motion.create(DropdownMenuTrigger);

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  badgeCounts?: Record<string, string | number>;
  onHelpClick?: () => void;
}

export function AppSidebar({
  badgeCounts,
  onHelpClick,
  className,
  ...props
}: AppSidebarProps) {
  const { user: authUser } = useAppSelector((state) => state?.auth);
  const location = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isExpanded = isMobile || state === "expanded";

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(
    authUser?.workspaceName || "RPRDAC Academy",
  );

  const userType = authUser?.userType?.toLowerCase() || "";
  const isAdmin = userType === "admin" || userType === "superadmin";

  const allowedPanels = (authUser?.allowedPanels || []).map((p: string) =>
    p.toLowerCase().trim(),
  );
  const allowedRoutes = (authUser?.allowedRoutes || []).map((r: string) =>
    r.toLowerCase().trim(),
  );

  const user = {
    name: authUser?.userName || "Jordan Davis",
    phone: authUser?.phone || "017653XXXXX",
    avatar: authUser?.profilePicture || "",
    role: authUser?.role || "School administrator",
  };

  const workspaceList: string[] =
    Array.isArray(sidebarData?.workspaces) && sidebarData.workspaces.length > 0
      ? sidebarData.workspaces
          .map((w: any) => w.title || w.name)
          .filter(Boolean)
      : [selectedWorkspace];

  useEffect(() => {
    if (authUser?.workspaceName) {
      setSelectedWorkspace(authUser.workspaceName);
    }
  }, [authUser?.workspaceName]);

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderIcon = (
    IconComponent?: React.ElementType | React.ReactNode,
    className = "h-[18px] w-[18px]",
  ) => {
    if (!IconComponent) return null;
    if (React.isValidElement(IconComponent)) return IconComponent;
    const Icon = IconComponent as React.ElementType;
    return <Icon className={className} strokeWidth={1.85} />;
  };

  const isRouteActive = (path?: string) => {
    if (!path || path === "#") return false;
    const currentPath = location?.pathname?.toLowerCase() || "";
    const targetPath = path.toLowerCase();
    if (targetPath === "/") return currentPath === "/";
    return (
      currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
    );
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
      (panel: string) =>
        panel === itemTitle || panel === itemKey || itemTitle.includes(panel),
    );
  };

  // Direct Route/Sub-item Access Verification
  const hasRouteAccess = (sub: any) => {
    if (isAdmin) return true;
    const subKey = (sub.routeKey || sub.key || "").toLowerCase().trim();
    const subUrl = (sub.url || sub.path || "").toLowerCase().trim();
    const subTitle = (sub.title || sub.name || "").toLowerCase().trim();

    return allowedRoutes?.some(
      (route: string) =>
        route === subKey ||
        route === subTitle ||
        subUrl.includes(route) ||
        route.includes(subKey),
    );
  };

  const getBadgeValue = (item: any) => {
    const key = (item.routeKey || item.key || item.title || item.name || "")
      .toLowerCase()
      .trim();
    if (badgeCounts && key in badgeCounts) {
      return badgeCounts[key];
    }
    return item.badge ?? null;
  };

  const SubNavLink = ({ sub }: { sub: any }) => {
    if (!isAdmin && !hasRouteAccess(sub)) return null;
    const active = isRouteActive(sub.url || sub.path);

    return (
      <Link
        to={sub.url || sub.path || "#"}
        onClick={handleNavClick}
        className={cn(
          "relative flex items-center gap-2.5 rounded-xl py-2 pl-9 pr-3 text-[13px] transition-all duration-150",
          active
            ? "bg-white font-semibold text-[#2B82C9] shadow-[0_4px_12px_rgba(15,65,110,0.12)]"
            : "font-medium text-white/90 hover:bg-white/12 hover:text-white",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            active ? "bg-[#2B82C9]" : "bg-white/50",
          )}
        />
        {sub.icon && (
          <span className="shrink-0">
            {renderIcon(sub.icon, "h-3.5 w-3.5")}
          </span>
        )}
        <span className="truncate">{sub.title || sub.name}</span>
      </Link>
    );
  };

  const renderNavItem = (item: any) => {
    const hasSubItems = Array.isArray(item?.items) && item.items.length > 0;

    const filteredSubItems = hasSubItems
      ? item.items.filter((sub: any) => isAdmin || hasRouteAccess(sub))
      : [];

    const itemHasPanelAccess = hasPanelAccess(item);

    if (!itemHasPanelAccess && filteredSubItems.length === 0) {
      return null;
    }

    const panelKey = item.title || item.name;
    const badge = getBadgeValue(item);

    // Leaf item (no children)
    if (!hasSubItems || filteredSubItems.length === 0) {
      if (!itemHasPanelAccess && !hasRouteAccess(item)) return null;

      const active = isRouteActive(item.url || item.path);

      return (
        <motion.div
          key={panelKey}
          whileHover={{ x: isExpanded && !active ? 2 : 0 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.15 }}
        >
          <Link
            to={item.url || item.path || "#"}
            onClick={handleNavClick}
            title={!isExpanded ? panelKey : undefined}
            className={cn(
              "group flex items-center rounded-xl transition-all duration-150",
              isExpanded
                ? "justify-between px-3.5 py-2.5"
                : "justify-center p-2.5",
              active
                ? "bg-white text-[#2B82C9] shadow-[0_6px_16px_rgba(15,65,110,0.14)]"
                : "text-white hover:bg-white/12",
            )}
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center transition-colors",
                  active
                    ? "text-[#2B82C9]"
                    : "text-white/95 group-hover:text-white",
                )}
              >
                {renderIcon(item.icon, "h-[18px] w-[18px]")}
              </span>

              {isExpanded && (
                <span
                  className={cn(
                    "truncate text-[14px] leading-none tracking-[-0.01em]",
                    active
                      ? "font-semibold text-[#2B82C9]"
                      : "font-medium text-white",
                  )}
                >
                  {panelKey}
                </span>
              )}
            </div>

            {isExpanded && badge !== null && badge !== undefined && (
              <span
                className={cn(
                  "ml-2 shrink-0 text-[12.5px] font-semibold tabular-nums",
                  active ? "text-[#2B82C9]" : "text-white/90",
                )}
              >
                {typeof badge === "number" ? badge.toLocaleString() : badge}
              </span>
            )}
          </Link>
        </motion.div>
      );
    }

    // Expandable panel
    const isChildActive = filteredSubItems.some((sr: any) =>
      isRouteActive(sr.url || sr.path),
    );
    const isCurrentExpanded = expandedPanels[panelKey] ?? isChildActive;

    return (
      <div key={panelKey} className="space-y-0.5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.99 }}
          onClick={() => togglePanel(panelKey)}
          title={!isExpanded ? panelKey : undefined}
          className={cn(
            "group flex w-full items-center rounded-xl transition-all duration-150",
            isExpanded
              ? "justify-between px-3.5 py-2.5"
              : "justify-center p-2.5",
            isChildActive
              ? "bg-white/18 text-white"
              : "text-white hover:bg-white/12",
          )}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="flex shrink-0 items-center justify-center text-white/95 group-hover:text-white">
              {renderIcon(item.icon, "h-[18px] w-[18px]")}
            </span>

            {isExpanded && (
              <span className="truncate text-[14px] font-medium leading-none tracking-[-0.01em] text-white">
                {panelKey}
              </span>
            )}
          </div>

          {isExpanded && (
            <div className="flex shrink-0 items-center gap-2">
              {badge !== null && badge !== undefined && (
                <span className="text-[12.5px] font-semibold tabular-nums text-white/90">
                  {typeof badge === "number" ? badge.toLocaleString() : badge}
                </span>
              )}
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-white/80 transition-transform duration-200 ease-out",
                  isCurrentExpanded && "rotate-90 text-white",
                )}
              />
            </div>
          )}
        </motion.button>

        <AnimatePresence initial={false}>
          {isCurrentExpanded && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1 pb-1">
                {filteredSubItems.map((sub: any) => (
                  <SubNavLink
                    key={sub.routeKey || sub.url || sub.path || sub.title}
                    sub={sub}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderNavSection = (items: any[], sectionTitle: string) => {
    const renderedItems = (items || [])
      .map((item) => renderNavItem(item))
      .filter(Boolean);

    if (renderedItems.length === 0) return null;

    return (
      <div className="pt-4 first:pt-0">
        {isExpanded && sectionTitle && (
          <p className="mb-2.5 px-3.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/75">
            {sectionTitle}
          </p>
        )}
        <div className="space-y-1">{renderedItems}</div>
      </div>
    );
  };

  const workspaceInitial = (selectedWorkspace || "R").charAt(0).toUpperCase();

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className={cn(
        "border-r border-[#4B9FE0]/60 bg-[#5EB1EE] text-white shadow-none [&_[data-slot=sidebar-container]]:bg-[#5EB1EE] [&_[data-slot=sidebar-inner]]:bg-[#5EB1EE]",
        className,
      )}
    >
      {/* ========== BRAND HEADER ========== */}
      <SidebarHeader className="px-4 pt-5 pb-3 bg-[#5EB1EE]">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              to="/"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-xl transition-opacity hover:opacity-95",
                !isExpanded && "justify-center",
              )}
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3B93DC] shadow-[0_3px_10px_rgba(15,65,110,0.14)]"
              >
                <Command className="h-5 w-5" strokeWidth={2.2} />
              </motion.div>

              {isExpanded && (
                <div className="flex min-w-0 flex-col text-left">
                  <span className="truncate text-[18px] font-bold leading-tight tracking-tight text-white">
                    rprdac
                  </span>
                  <span className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.11em] text-white/80">
                    EDUCATION PORTAL
                  </span>
                </div>
              )}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* ========== WORKSPACE SWITCHER CARD ========== */}
        {isExpanded && (
          <div className="mt-4">
            <DropdownMenu>
              <MotionDropdownTrigger
                type="button"
                whileTap={{ scale: 0.99 }}
                className="flex w-full items-center justify-between rounded-[14px] border border-white/25 bg-white/14 px-3 py-2.5 text-left text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/22 text-[14px] font-bold text-white">
                    {workspaceInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold leading-snug text-white">
                      {selectedWorkspace}
                    </p>
                    <p className="truncate text-[11px] font-normal leading-tight text-white/75">
                      {isAdmin ? "Administrator" : user.role}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-white/85" />
              </MotionDropdownTrigger>

              <DropdownMenuContent
                align="start"
                className="w-56 rounded-xl border-slate-200/90 bg-white p-1 text-slate-800 shadow-lg"
              >
                {workspaceList.map((wsName: string) => (
                  <DropdownMenuItem
                    key={wsName}
                    onClick={() => setSelectedWorkspace(wsName)}
                    className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:bg-slate-100"
                  >
                    {wsName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarHeader>

      {/* ========== NAVIGATION SECTIONS ========== */}
      <SidebarContent className="bg-[#5EB1EE] px-3 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="space-y-2 pb-3">
          {renderNavSection(sidebarData?.navMain || [], "MAIN MENUS")}
          {renderNavSection(
            sidebarData?.navSecondary || [],
            "SECONDARY MODULES",
          )}

          {isAdmin &&
            Array.isArray(sidebarData?.projects) &&
            sidebarData.projects.length > 0 &&
            renderNavSection(sidebarData.projects, "CONTROL PANEL & ACCESS")}

          {isAdmin &&
            Array.isArray(sidebarData?.workspaces) &&
            sidebarData.workspaces.length > 0 &&
            renderNavSection(sidebarData.workspaces, "WORKSPACES & ACCESS")}
        </div>
      </SidebarContent>

      {/* ========== HELP CARD + USER FOOTER ========== */}
      <SidebarFooter className="gap-3 bg-[#5EB1EE] px-3 pt-2 pb-4">
         <div className="border-t border-white/15 pt-3">
          <NavUser user={user} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
