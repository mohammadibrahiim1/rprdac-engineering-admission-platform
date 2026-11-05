import { Folder, Zap, BookOpen, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionCardProps {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor?: 'purple' | 'blue' | 'sky' | 'amber';
  progressLabel: string;
  progressValue: number;
  progressMax: number;
  footerLeft: string;
  onClick: () => void;
  isActive?: boolean;
}

const badgeStyles = {
  purple: 'bg-violet-100 text-violet-700 border-violet-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  sky: 'bg-sky-100 text-sky-700 border-sky-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
};

const iconMap = {
  purple: Folder,
  blue: BookOpen,
  sky: Target,
  amber: Zap,
};

export const StudentSessionCard = ({
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  progressLabel,
  progressValue,
  progressMax,
  footerLeft,
  onClick,
  isActive = false,
}: SessionCardProps) => {
  const Icon = iconMap[badgeColor];
  const percent = Math.min(
    100,
    Math.round((progressValue / progressMax) * 100),
  );

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-4 rounded-xl border bg-white transition-all duration-200 group
        ${
          isActive
            ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md'
            : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg'
        }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${badgeStyles[badgeColor]} border`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}
        >
          {badge}
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
        {title}
      </h3>
      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
        {subtitle}
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="font-medium text-slate-600">{progressLabel}</span>
          <span className="font-bold text-slate-800">
            {progressValue.toLocaleString()} / {progressMax.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">{footerLeft}</span>
        <span className="font-semibold text-indigo-600 group-hover:underline">
          Explore →
        </span>
      </div>
    </motion.button>
  );
};
