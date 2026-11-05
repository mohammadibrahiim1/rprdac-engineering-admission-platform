import { User } from 'lucide-react';
import { motion } from 'framer-motion';

// @ts-ignore
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(
    amount,
  );

// @ts-ignore
const SellerPerformance = ({ summary, handleSetSession }) => {
  if (!summary || summary?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded border border-slate-200 bg-white p-10 text-center">
        <User size={32} className="text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">No summary found!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b bg-gradient-to-r from-slate-50 to-white px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse uppercase" />
          Green Card Summary
        </h3>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50/50">
            <tr>
              <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                Session
              </th>
              <th className="px-5 py-3 text-center text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                Cards
              </th>
              <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary?.map(
              (
                // @ts-ignore
                sum,
                i,
              ) => (
                <tr
                  onClick={() => handleSetSession(sum.session)}
                  key={i}
                  className="group transition-colors hover:bg-blue-50/40 cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-[#0070bb] text-[13px] capitalize">
                          {sum.session}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center text-[13px] font-bold text-[#0070bb]">
                      {sum.totalCards}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-[13px] font-bold text-slate-700">
                    {formatCurrency(sum.totalRevenue)}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SellerPerformance;
