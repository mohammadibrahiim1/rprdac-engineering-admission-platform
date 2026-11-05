// payment/PaymentFooter.jsx

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function PaymentFooter({ dueAmount = 0, studentPaid = 0 }) {
  const isFullyPaid = Number(dueAmount) <= 0 && Number(studentPaid) > 0;

  return (
    <div
      className={`p-4 rounded-lg flex items-center gap-3 border transition-colors ${
        isFullyPaid
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}
    >
      {isFullyPaid ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
      )}
      <div className="text-xs">
        <p className="font-semibold">
          {isFullyPaid
            ? 'Payment Status: Fully Paid'
            : 'Payment Status: Pending / Partial'}
        </p>
        <p className="text-slate-600 mt-0.5">
          {isFullyPaid
            ? 'Student has cleared all the due fees for this section.'
            : `Outstanding balance of ৳ ${Number(dueAmount).toLocaleString()} needs to be cleared.`}
        </p>
      </div>
    </div>
  );
}
