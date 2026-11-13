"use client";

import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PasswordFieldProps {
  label: string;
  panel: string;
  value: string;
  show: boolean;
  onToggle: (panel: string) => void;
  onChange: (panel: string, value: string) => void;
}

export function PasswordField({
  label,
  panel,
  value,
  show,
  onToggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} Panel
      </Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(panel, e.target.value)}
          placeholder={`Set ${label} password`}
          className="pr-10 text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
          onClick={() => onToggle(panel)}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
