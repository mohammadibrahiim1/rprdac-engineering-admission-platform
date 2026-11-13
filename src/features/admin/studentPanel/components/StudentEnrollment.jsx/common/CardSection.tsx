import React, { type FC, type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

export interface CardSectionProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  iconColor?: string;
  title: string;
  badge?: ReactNode;
  children?: ReactNode;
}

export const CardSection: FC<CardSectionProps> = ({
  icon: Icon,
  iconColor = "",
  title,
  badge,
  children,
}) => {
  return (
    <div className="rounded-md border border-[#e9e8e3] overflow-visible">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#fafaf8] border-b border-[#f1f0ee] rounded-t-xl">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-[12.5px] font-semibold text-[#37352f]">
          {title}
        </span>
        {badge}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default CardSection;
