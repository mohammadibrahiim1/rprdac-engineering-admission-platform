import { ROUTE_CONFIG } from "@/constants/routes.config";
import { RouteItem } from "@/features/admin/accountcreationPanel/types/PanelAccess.types";

export function getRoutesForPanel(
  panelType: string,
  userRole: string = "admin",
): RouteItem[] {
  if (panelType === "control" || panelType === "controlPanel") {
    return (ROUTE_CONFIG?.controlPanelRoutes || []).filter(
      (route: any) =>
        Array.isArray(route.roles) && route.roles.includes(userRole),
    );
  }

  if (panelType === "account" || panelType === "accountPanel") {
    return (ROUTE_CONFIG.accountPanelRoutes || []).filter(
      (route: any) =>
        Array.isArray(route.roles) && route.roles.includes(userRole),
    );
  }

  const matchedPanel = ROUTE_CONFIG.panels?.find(
    (p: any) => p.panelType === panelType,
  );

  if (!matchedPanel?.subRoutes) return [];

  return matchedPanel.subRoutes.filter(
    (sub: any) => Array.isArray(sub.roles) && sub.roles.includes(userRole),
  );
}
