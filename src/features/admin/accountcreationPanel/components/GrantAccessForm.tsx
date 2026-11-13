"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Save,
  Loader2,
  CheckSquare,
  Square,
  Layers,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ALL_PANELS } from "@/constants/panels";
import { cn } from "@/lib/utils";
import { useAssignPanelToUserMutation } from "../services/panelAccessApi";
import { getRoutesForPanel } from "@/lib/PanelAccess.utils";
import { toast } from "sonner";

interface GrantAccessFormProps {
  onSuccess: () => void;
}

export function GrantAccessForm({ onSuccess }: GrantAccessFormProps) {
  const [userId, setUserId] = useState("");
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [panelPassword, setPanelPassword] = useState("");
  const [note, setNote] = useState("");

  const [assignPanelToUser, { isLoading }] = useAssignPanelToUserMutation();

  const handlePanelToggle = (panel: string) => {
    setSelectedPanels((prev) => {
      const exists = prev.includes(panel);
      if (exists) {
        const panelRoutes = getRoutesForPanel(panel).map((r) => r.key);
        setSelectedRoutes((rPrev) =>
          rPrev.filter((key) => !panelRoutes.includes(key)),
        );
        return prev.filter((p) => p !== panel);
      }
      return [...prev, panel];
    });
  };

  const handleRouteToggle = (routeKey: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeKey)
        ? prev.filter((k) => k !== routeKey)
        : [...prev, routeKey],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) return toast.error("Please enter a User ID");
    if (selectedPanels.length === 0)
      return toast.error("Please select at least one panel");
    if (!panelPassword.trim())
      return toast.error("Please enter panel password");

    try {
      await assignPanelToUser({
        userId: userId.trim(),
        panels: selectedPanels,
        routes: selectedRoutes,
        panelPassword: panelPassword.trim(),
        note: note.trim() || undefined,
      }).unwrap();

      toast.success("Permissions assigned successfully!");
      setUserId("");
      setSelectedPanels([]);
      setSelectedRoutes([]);
      setPanelPassword("");
      setNote("");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to assign panel access");
    }
  };

  return (
    <Card>
      <CardHeader className="border-b bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Grant Access Rights</CardTitle>
            <CardDescription>
              Assign panels and granular route endpoints to a staff user.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top fields */}
          <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase">
                User ID <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. 891626"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase">
                Security Key <span className="text-destructive">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Enter Security Password"
                value={panelPassword}
                onChange={(e) => setPanelPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs font-semibold uppercase">
                <FileText className="h-3 w-3" /> Remarks / Note
              </Label>
              <Input
                placeholder="Optional note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Panel selectors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase">
                1. Select Panels <span className="text-destructive">*</span>
              </Label>
              <Badge variant="secondary">
                {selectedPanels.length} Selected
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {ALL_PANELS.map((panel) => {
                const isSelected = selectedPanels.includes(panel);
                return (
                  <Button
                    key={panel}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="justify-between capitalize"
                    onClick={() => handlePanelToggle(panel)}
                  >
                    <span>{panel}</span>
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4 opacity-40" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Route selectors */}
          {selectedPanels.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label className="text-xs font-semibold uppercase">
                  2. Sub-Route Access Controls
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Select specific sub-routes. If none are selected, full panel
                  access is granted by default.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectedPanels.map((panel) => {
                  const routes = getRoutesForPanel(panel);
                  if (routes.length === 0) return null;

                  return (
                    <div
                      key={panel}
                      className="space-y-2.5 rounded-lg border bg-muted/40 p-3.5"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary">
                          <Layers className="h-3.5 w-3.5" />
                          {panel} Routes
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {routes.length} Available
                        </Badge>
                      </div>

                      <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                        {routes.map((route) => {
                          const isChecked = selectedRoutes.includes(route.key);
                          return (
                            <button
                              key={route.key}
                              type="button"
                              onClick={() => handleRouteToggle(route.key)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                                isChecked
                                  ? "border border-primary/30 bg-primary/10 font-semibold text-primary"
                                  : "border border-transparent text-muted-foreground hover:bg-muted",
                              )}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isChecked ? (
                                  <CheckSquare className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                  <Square className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                )}
                                <span className="truncate">{route.name}</span>
                              </div>
                              <span className="shrink-0 font-mono text-[10px] opacity-60">
                                {route.key}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Grant Access Scope
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
