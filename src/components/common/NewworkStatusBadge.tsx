import React from "react";
import { cn } from "../../utils/cn";

export interface NetworkStatusBadgeProps {
  isLocalNetwork: boolean;
  className?: string;
}

export const NetworkStatusBadge: React.FC<NetworkStatusBadgeProps> = ({
  isLocalNetwork,
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-all",
        isLocalNetwork
          ? "bg-amber-100 text-amber-800 border border-amber-300"
          : "bg-emerald-100 text-emerald-800 border border-emerald-300",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isLocalNetwork ? "bg-amber-500 animate-pulse" : "bg-emerald-500",
        )}
      />
      <span>
        {isLocalNetwork ? "Office Network (Offline)" : "Cloud Live System"}
      </span>
    </div>
  );
};
