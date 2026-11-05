import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  subLabel?: string;
  accent?: 'blue' | 'emerald' | 'rose' | 'indigo' | 'amber';
}

const accentMap = {
  blue: {
    bg: 'from-sky-500 to-blue-600',
    glow: 'rgba(14,165,233,0.35)',
    iconBg: 'bg-sky-400/20',
    text: 'text-sky-50',
  },
  emerald: {
    bg: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.35)',
    iconBg: 'bg-emerald-400/20',
    text: 'text-emerald-50',
  },
  rose: {
    bg: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.35)',
    iconBg: 'bg-rose-400/20',
    text: 'text-rose-50',
  },
  indigo: {
    bg: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.35)',
    iconBg: 'bg-indigo-400/20',
    text: 'text-indigo-50',
  },
  amber: {
    bg: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.35)',
    iconBg: 'bg-amber-400/20',
    text: 'text-amber-50',
  },
};

export const StudentStatCard = ({
  icon: Icon,
  value,
  label,
  subLabel,
  accent = 'blue',
}: StatCardProps) => {
  const colors = accentMap[accent];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-br ${colors.bg} border border-white/10 shadow-lg backdrop-blur-sm min-w-[140px]`}
      style={{ boxShadow: `0 8px 24px ${colors.glow}` }}
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg ${colors.iconBg} border border-white/20`}
      >
        <Icon className={`w-5 h-5 ${colors.text}`} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xl font-black text-white tracking-tight leading-none truncate">
          {value}
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white/75 mt-0.5">
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-white/60 mt-0.5 truncate">
            {subLabel}
          </span>
        )}
      </div>
    </motion.div>
  );
};
