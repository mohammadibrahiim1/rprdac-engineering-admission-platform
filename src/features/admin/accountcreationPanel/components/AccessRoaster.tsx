"use client";

import { useState } from "react";
import { Trash2, Loader2, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { AccessUser, RemovalMap } from "../types/PanelAccess.types";
import {
  useGetAllUsersPanelsQuery,
  useRemovePanelFromUserMutation,
} from "../services/panelAccessApi";
import { toast } from "sonner";

export function AccessRoster() {
  const [removalMap, setRemovalMap] = useState<RemovalMap>({});

  const { data, isLoading, isError, error, refetch } =
    useGetAllUsersPanelsQuery();

  const [removeUserPanel, { isLoading: removeLoading }] =
    useRemovePanelFromUserMutation();

  const accessUsers: AccessUser[] = data?.users ?? [];

  const handlePanelRemovalToggle = (uId: string, panel: string) => {
    setRemovalMap((prev) => {
      const current = prev[uId] || { panels: [], routes: [] };
      const exists = current.panels.includes(panel);
      const updatedPanels = exists
        ? current.panels.filter((p) => p !== panel)
        : [...current.panels, panel];

      return {
        ...prev,
        [uId]: { ...current, panels: updatedPanels },
      };
    });
  };

  const handleRouteRemovalToggle = (uId: string, routeKey: string) => {
    setRemovalMap((prev) => {
      const current = prev[uId] || { panels: [], routes: [] };
      const exists = current.routes.includes(routeKey);
      const updatedRoutes = exists
        ? current.routes.filter((r) => r !== routeKey)
        : [...current.routes, routeKey];

      return {
        ...prev,
        [uId]: { ...current, routes: updatedRoutes },
      };
    });
  };

  const handleRemoveSubmit = async (uId: string) => {
    const userMap = removalMap[uId];
    const panelsToRemove = userMap?.panels ?? [];
    const routesToRemove = userMap?.routes ?? [];

    if (panelsToRemove.length === 0 && routesToRemove.length === 0) {
      return toast.error("Please select at least one panel or route to remove");
    }

    try {
      await removeUserPanel({
        userId: uId,
        panelsToRemove,
        routesToRemove,
      }).unwrap();

      setRemovalMap((prev) => ({
        ...prev,
        [uId]: { panels: [], routes: [] },
      }));

      toast.success("Access privileges removed successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove permissions");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 border-b bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Active Staff Access Roster</CardTitle>
          <CardDescription>
            Click any panel badge or route chip to flag it for removal.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh Matrix
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Fetching permissions matrix...</span>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-sm text-destructive">
            Error loading access list:{" "}
            {(error as any)?.data?.message || "Server error"}
          </div>
        ) : accessUsers.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No staff members found with active access permissions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>User Details</TableHead>
                  <TableHead>Allowed Panels</TableHead>
                  <TableHead>Allowed Sub-Routes</TableHead>
                  <TableHead className="w-40 text-center">Revoke</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessUsers.map((user, index) => {
                  const uId = user.userId;
                  const selected = removalMap[uId] || {
                    panels: [],
                    routes: [],
                  };
                  const panelsToRemove = selected.panels;
                  const routesToRemove = selected.routes;
                  const totalSelected =
                    panelsToRemove.length + routesToRemove.length;

                  return (
                    <TableRow key={user._id || uId || index}>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold capitalize">
                          {user.userName || "N/A"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs">
                          <span className="font-mono font-medium text-primary">
                            ID: {uId}
                          </span>
                          {user.phone && (
                            <span className="text-muted-foreground">
                              ({user.phone})
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Panels */}
                      <TableCell>
                        <div className="flex max-w-xs flex-wrap gap-1.5">
                          {user.allowedPanels &&
                          user.allowedPanels.length > 0 ? (
                            user.allowedPanels.map((panel) => {
                              const marked = panelsToRemove.includes(panel);
                              return (
                                <button
                                  key={panel}
                                  type="button"
                                  onClick={() =>
                                    handlePanelRemovalToggle(uId, panel)
                                  }
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold capitalize transition-all",
                                    marked
                                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                                      : "border-border bg-muted text-foreground hover:border-muted-foreground/40",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      marked
                                        ? "animate-pulse bg-destructive"
                                        : "bg-primary",
                                    )}
                                  />
                                  {panel}
                                  {marked && <X className="h-3 w-3" />}
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-xs italic text-muted-foreground">
                              No Panels Assigned
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Routes */}
                      <TableCell>
                        <div className="flex max-w-md flex-wrap gap-1.5">
                          {user.allowedRoutes &&
                          user.allowedRoutes.length > 0 ? (
                            user.allowedRoutes.map((routeKey) => {
                              const marked = routesToRemove.includes(routeKey);
                              return (
                                <button
                                  key={routeKey}
                                  type="button"
                                  onClick={() =>
                                    handleRouteRemovalToggle(uId, routeKey)
                                  }
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs transition-all",
                                    marked
                                      ? "border-destructive/50 bg-destructive/15 font-bold text-destructive"
                                      : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
                                  )}
                                >
                                  {routeKey}
                                  {marked && <X className="h-3 w-3" />}
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-xs italic text-muted-foreground">
                              Full Panel Scope
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant={
                            totalSelected > 0 ? "destructive" : "outline"
                          }
                          disabled={removeLoading || totalSelected === 0}
                          onClick={() => handleRemoveSubmit(uId)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          {totalSelected > 0
                            ? `Remove (${totalSelected})`
                            : "Select Items"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
