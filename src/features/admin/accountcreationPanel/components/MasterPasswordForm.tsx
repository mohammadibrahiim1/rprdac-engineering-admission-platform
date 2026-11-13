"use client";

import { useState } from "react";
import { Lock, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSetAdminPanelPasswordMutation } from "../services/panelAccessApi";
import { PasswordField } from "./PasswordFiled";
import { toast } from "sonner";

export function MasterPasswordForm() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [setAdminPanelPassword, { isLoading }] =
    useSetAdminPanelPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      return toast.error("Please enter a password");
    }

    try {
      const res = await setAdminPanelPassword({
        panelPasswords: { master: password.trim() },
      }).unwrap();

      if (res?.success || res?.status === "success") {
        toast.success(res?.message || "Master password updated successfully!");
        setPassword("");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update password");
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
          <Lock className="h-5 w-5" />
        </div>
        <CardTitle>Master Password Override</CardTitle>
        <CardDescription>
          Update global access controls for system operations.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Master Security Key"
            panel="master"
            value={password}
            show={show}
            onToggle={() => setShow((s) => !s)}
            onChange={(_, val) => setPassword(val)}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Update Master Credentials
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
