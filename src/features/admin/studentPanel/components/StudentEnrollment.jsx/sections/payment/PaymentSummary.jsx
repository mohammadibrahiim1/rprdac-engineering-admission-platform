import React from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  UserPlus,
  Receipt,
  Tag,
  CheckCircle2,
  Wallet,
  Sparkles,
} from 'lucide-react';

export default function PaymentSummary({
  student,
  balanceDue = 0,
  paymentProgress = 0,
  isSubmitting = false,
}) {
  // Calculated Values & Fallbacks
  const admissionFee = Number(student?.admissionFee || 0);
  const referenceDiscount = Number(student?.referenceDiscount || 0);
  const admissionFeePaid = Number(student?.admissionFeePaid || 0);
  const messServiceCharge = Number(student?.messServiceCharge || 0);
  const messServiceChargePaid = Number(student?.messServiceChargePaid || 0);
  const totalCollection = Number(
    student?.messServiceChargePaid + student?.admissionFeePaid || 0,
  );
  const safeProgress = Math.min(100, Math.max(0, paymentProgress));

  const summaryItems = [
    {
      label: 'Admission Fee',
      value: `৳ ${admissionFee?.toLocaleString()}`,
      color: 'text-slate-800 font-semibold',
      icon: Receipt,
      bg: 'bg-slate-100/80 text-slate-600',
    },
    {
      label: 'Amount Paid',
      value: `৳ ${admissionFeePaid?.toLocaleString()}`,
      color: 'text-emerald-600 font-bold',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Mess Service Charge',
      value: `৳ ${messServiceCharge?.toLocaleString()}`,
      color: 'text-emerald-600 font-bold',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Mess Service Charge Paid',
      value: `৳ ${messServiceChargePaid?.toLocaleString()}`,
      color: 'text-emerald-600 font-bold',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Total Collection',
      value: `৳ ${totalCollection?.toLocaleString()}`,
      color: 'text-emerald-600 font-bold',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Balance Due',
      value: `৳ ${balanceDue.toLocaleString()}`,
      color:
        balanceDue > 0
          ? 'text-rose-600 font-extrabold'
          : 'text-emerald-600 font-bold',
      icon: Wallet,
      bg:
        balanceDue > 0
          ? 'bg-rose-50 text-rose-600'
          : 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="relative group p-[1px] rounded-md bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent hover:from-indigo-500/40 hover:via-purple-500/30 hover:to-pink-500/20 transition-all duration-500 shadow-xl shadow-indigo-950/5 overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-md overflow-hidden flex flex-col justify-between h-full">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold tracking-wide">Payment Summary</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5">
          {summaryItems?.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-md hover:bg-slate-50/80 border border-transparent hover:border-slate-100 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {item.label}
                  </span>
                </div>
                <span className={`text-sm tracking-tight ${item.color}`}>
                  {item.value}
                </span>
              </div>
            );
          })}

          {/* Payment Progress Section */}
          <div className="pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Payment Progress
                </span>
                <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                  {safeProgress.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${safeProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-5 pt-1">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={isSubmitting}
            className="relative w-full overflow-hidden group/btn flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-md hover:from-indigo-500 hover:to-purple-600 transition-all duration-300 text-xs font-bold tracking-wide shadow-md shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-in-out" />

            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                <span className="uppercase">Complete Enrollment</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
