"use client";

import { useForm } from "react-hook-form";
import {
  KeyRound,
  FileText,
  Layers,
  Save,
  Loader2,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ALL_PANELS } from "@/constants/panels";
import { cn } from "@/lib/utils";
import { useAssignPanelToUserMutation } from "../services/panelAccessApi";
import { getRoutesForPanel } from "@/lib/PanelAccess.utils";
import { toast } from "sonner";

interface GrantAccessFormValues {
  userId: string;
  selectedPanels: string[];
  selectedRoutes: string[];
  panelPassword: string;
  note?: string;
}

interface GrantAccessFormProps {
  onSuccess?: () => void;
}

export function GrantAccessForm({ onSuccess }: GrantAccessFormProps) {
  const [assignPanelToUser, { isLoading }] = useAssignPanelToUserMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GrantAccessFormValues>({
    defaultValues: {
      userId: "",
      selectedPanels: [],
      selectedRoutes: [],
      panelPassword: "",
      note: "",
    },
  });

  const selectedPanels = watch("selectedPanels");
  const selectedRoutes = watch("selectedRoutes");

  const handlePanelToggle = (panel: string) => {
    const exists = selectedPanels.includes(panel);
    let updatedPanels: string[];
    let updatedRoutes = [...selectedRoutes];

    if (exists) {
      updatedPanels = selectedPanels.filter((p) => p !== panel);
      const panelRoutes = getRoutesForPanel(panel).map((r) => r.key);
      updatedRoutes = updatedRoutes.filter((key) => !panelRoutes.includes(key));
    } else {
      updatedPanels = [...selectedPanels, panel];
    }

    setValue("selectedPanels", updatedPanels, { shouldValidate: true });
    setValue("selectedRoutes", updatedRoutes);
  };

  const handleRouteToggle = (routeKey: string) => {
    const exists = selectedRoutes.includes(routeKey);
    const updatedRoutes = exists
      ? selectedRoutes.filter((k) => k !== routeKey)
      : [...selectedRoutes, routeKey];

    setValue("selectedRoutes", updatedRoutes);
  };

  const onSubmit = async (data: GrantAccessFormValues) => {
    if (data.selectedPanels.length === 0) {
      toast.error("Please select at least one panel scope");
      return;
    }

    try {
      await assignPanelToUser({
        userId: data.userId.trim(),
        panels: data.selectedPanels,
        routes: data.selectedRoutes,
        panelPassword: data.panelPassword.trim(),
        note: data.note?.trim() || undefined,
      }).unwrap();

      toast.success("Panel access permissions granted securely!");
      reset();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(errorObj?.data?.message || "Failed to assign panel access");
    }
  };

  return (
    <div className="pb-12">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: Inputs & Panel Selection (Col 6) */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-slate-200/80 shadow-sm bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white pb-4">
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" /> User
                  Credentials & Panels
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Enter target account ID, password, and choose active panel
                  scopes.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                {/* User ID */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    User ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. 01742590128"
                    {...register("userId", { required: "User ID is required" })}
                    className="font-mono text-sm bg-white border-slate-200 focus-visible:ring-indigo-500"
                  />
                  {errors.userId && (
                    <p className="text-[11px] font-medium text-destructive">
                      {errors.userId.message}
                    </p>
                  )}
                </div>

                {/* Security Key */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-600" />{" "}
                    Security Key <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    {...register("panelPassword", {
                      required: "Security password is required",
                    })}
                    className="bg-white border-slate-200 focus-visible:ring-indigo-500"
                  />
                  {errors.panelPassword && (
                    <p className="text-[11px] font-medium text-destructive">
                      {errors.panelPassword.message}
                    </p>
                  )}
                </div>

                {/* Remarks / Note */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" /> Remarks
                    / Note
                  </Label>
                  <Input
                    placeholder="Optional assignment note"
                    {...register("note")}
                    className="bg-white border-slate-200 focus-visible:ring-indigo-500"
                  />
                </div>

                {/* Panel Selectors on Left side */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                      Select Panels Scope{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Badge
                      variant="secondary"
                      className="bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      {selectedPanels.length} Selected
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {ALL_PANELS.map((panel) => {
                      const isSelected = selectedPanels.includes(panel);
                      return (
                        <button
                          key={panel}
                          type="button"
                          onClick={() => handlePanelToggle(panel)}
                          className={cn(
                            "group relative flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all duration-200 border text-left",
                            isSelected
                              ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-blue-50/50 text-indigo-950 shadow-xs ring-1 ring-indigo-500/20"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                          )}
                        >
                          <span className="truncate">{panel}</span>
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors",
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-300 bg-slate-50",
                            )}
                          >
                            {isSelected && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE: Dynamic Cards (1 Row = 3 Cards layout) (Col 6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white px-4 py-3 shadow-sm">
              <span className="text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" /> Sub-Route
                Privileges (Keys)
              </span>
              <Badge
                variant="outline"
                className="border-slate-700 bg-slate-800 text-indigo-300 font-mono text-[11px]"
              >
                {selectedRoutes.length} Keys Selected
              </Badge>
            </div>

            {selectedPanels.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center text-slate-400">
                <Layers className="h-10 w-10 stroke-1 mb-2 opacity-40" />
                <p className="text-xs font-semibold uppercase tracking-wider">
                  No panels selected
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Please check at least one panel on the left to configure
                  sub-route keys.
                </p>
              </div>
            ) : (
              /* 1 Row = 3 Cards grid layout */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedPanels.map((panel) => {
                  const routes = getRoutesForPanel(panel);
                  if (routes.length === 0) return null;

                  return (
                    <div
                      key={panel}
                      className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 truncate">
                          {panel}
                        </span>
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-indigo-600">
                          {routes.length} keys
                        </span>
                      </div>

                      <div className="max-h-48 space-y-1 overflow-y-auto pr-1 scrollbar-thin">
                        {routes.map((route) => {
                          const isChecked = selectedRoutes.includes(route.key);
                          return (
                            <button
                              key={route.key}
                              type="button"
                              onClick={() => handleRouteToggle(route.key)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[11px] transition-all",
                                isChecked
                                  ? "border border-indigo-200 bg-indigo-50/70 font-semibold text-indigo-950"
                                  : "border border-transparent text-slate-600 hover:bg-slate-50",
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <div
                                  className={cn(
                                    "flex h-3 w-3 shrink-0 items-center justify-center rounded text-[9px]",
                                    isChecked
                                      ? "bg-indigo-600 text-white"
                                      : "border border-slate-300",
                                  )}
                                >
                                  {isChecked && (
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                  )}
                                </div>
                                <span className="truncate">{route.name}</span>
                              </div>
                              <span className="shrink-0 rounded bg-slate-100 px-1 font-mono text-[9px] font-medium text-slate-600">
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
            )}

            {/* Submit Action Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md shadow-indigo-500/20 px-6 py-2.5 h-auto text-xs font-bold uppercase tracking-wider transition-all w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Granting Access...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Grant Access Permissions
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
