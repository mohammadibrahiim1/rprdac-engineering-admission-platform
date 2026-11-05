import React from 'react';
import { motion } from 'framer-motion';

export default function EnrollmentProgress({ progressPct = 0 }) {
  return (
    <div className="p-5 border-t border-slate-100 bg-slate-50/50">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-xs font-semibold text-slate-500">
          Completion Progress
        </span>
        <span className="text-xs font-bold text-slate-800 tabular-nums">
          {progressPct.toFixed(0)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#0d1b3e] rounded-full"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
