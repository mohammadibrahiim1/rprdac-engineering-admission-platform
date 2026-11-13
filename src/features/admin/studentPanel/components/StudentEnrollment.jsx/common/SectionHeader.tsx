import React, { type FC, type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

export interface SectionHeaderProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconBg?: string;
  title: string;
  subtitle?: string | ReactNode;
  children?: ReactNode;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  icon: Icon,
  iconBg = '',
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="flex items-start gap-3.5 mb-7 pb-5 border-b border-[#f1f0ee]">
      {Icon && (
        <div className={`p-2.5 rounded-md flex-shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-[#000000] leading-tight tracking-wider">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-[#9b9a97]">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default SectionHeader;