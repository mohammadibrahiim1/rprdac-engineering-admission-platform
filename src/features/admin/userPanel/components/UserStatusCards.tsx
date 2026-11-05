import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, UserCheck, Clock } from 'lucide-react';

export const UserStatsCards: React.FC<{ totalItems: number }> = ({
  totalItems,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1 */}
      <motion.div
        whileHover={{ y: -2 }}
        className="p-5 bg-[#f7f6f3] border border-[#37352f]/10 rounded-xl shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#37352f]/50 uppercase tracking-wider">
              Total Members
            </p>
            <h3 className="text-3xl font-bold text-[#37352f] mt-1">
              {totalItems?.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-emerald-600 font-medium">
          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
            +12.4%
          </span>
          <span className="text-[#37352f]/50">vs last month</span>
        </div>
      </motion.div>

      {/* Card 2 */}
      <motion.div
        whileHover={{ y: -2 }}
        className="p-5 bg-[#f7f6f3] border border-[#37352f]/10 rounded-xl shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#37352f]/50 uppercase tracking-wider">
              Seat Allocation
            </p>
            <h3 className="text-3xl font-bold text-[#37352f] mt-1">89.2%</h3>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="w-full bg-[#efede8] h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-sky-500 h-full rounded-full"
            style={{ width: '89.2%' }}
          ></div>
        </div>
      </motion.div>

      {/* Card 3 */}
      <motion.div
        whileHover={{ y: -2 }}
        className="p-5 bg-[#f7f6f3] border border-[#37352f]/10 rounded-xl shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#37352f]/50 uppercase tracking-wider">
              2FA Compliance
            </p>
            <h3 className="text-3xl font-bold text-[#37352f] mt-1">94.6%</h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg border border-teal-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-teal-700 font-medium">
          <span className="px-1.5 py-0.5 bg-teal-50 rounded border border-teal-200">
            Excellent
          </span>
          <span className="text-[#37352f]/50">Enforced Org-Wide</span>
        </div>
      </motion.div>

      {/* Card 4 */}
      <motion.div
        whileHover={{ y: -2 }}
        className="p-5 bg-[#f7f6f3] border border-[#37352f]/10 rounded-xl shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#37352f]/50 uppercase tracking-wider">
              Pending
            </p>
            <h3 className="text-3xl font-bold text-[#37352f] mt-1">28</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-amber-700 font-medium">
          <span className="text-[#37352f]/50">
            Expiring &lt;48h (9 sent today)
          </span>
        </div>
      </motion.div>
    </div>
  );
};
