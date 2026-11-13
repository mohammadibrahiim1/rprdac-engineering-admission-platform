"use client";

import { useState } from "react";
import { Save, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { ALL_PANELS } from "@/constants/panels";
import { useSetAdminPanelPasswordMutation } from "../services/panelAccessApi";
import { PasswordField } from "./PasswordFiled";
import { toast } from "sonner";

interface PanelPasswordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PanelPasswordsModal({
  open,
  onOpenChange,
}: PanelPasswordsModalProps) {
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  const [setAdminPanelPassword, { isLoading }] =
    useSetAdminPanelPasswordMutation();

  const handleChange = (panel: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [panel]: value }));
  };

  const toggleVisibility = (panel: string) => {
    setShowPass((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handleSubmit = async () => {
    const payload = Object.fromEntries(
      Object.entries(passwords).filter(([, v]) => v && v.trim() !== ""),
    );

    if (Object.keys(payload).length === 0) {
      return toast.error("Please enter at least one password");
    }

    try {
      const res = await setAdminPanelPassword({
        panelPasswords: payload,
      }).unwrap();

      if (res?.success || res?.status === "success") {
        toast.success(res?.message || "Passwords updated successfully!");
        setPasswords({});
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update passwords");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Update Module Credentials</DialogTitle>
          <DialogDescription>
            Set unique password overrides for specific panels.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto py-2 sm:grid-cols-2">
          {ALL_PANELS.map((p) => (
            <PasswordField
              key={p}
              label={p}
              panel={p}
              value={passwords[p] || ""}
              show={!!showPass[p]}
              onToggle={toggleVisibility}
              onChange={handleChange}
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Credentials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
