// payment/PaymentSummary.jsx

import React from 'react';
import {
  Calculator,
  Wallet,
  ArrowDownCircle,
  CheckCircle2,
} from 'lucide-react';

export default function PaymentSummary({
  courseFee = 0,
  admissionFee = 0,
  totalDiscount = 0,
  totalAfterDiscount = 0,
  studentPaid = 0,
  dueAmount = 0,
}) {
  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-white/20 pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-200" />
          <h4 className="font-semibold text-sm">Payment Overview</h4>
        </div>
        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
          Auto Calculated
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-amber-100">Base Course Fee</p>
          <p className="text-lg font-bold">
            ৳ {Number(courseFee).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-amber-100">Base Admission Fee</p>
          <p className="text-lg font-bold">
            ৳ {Number(admissionFee).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-amber-100">Total Discount</p>
          <p className="text-lg font-bold text-amber-200">
            - ৳ {Number(totalDiscount).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
          <p className="text-[11px] text-amber-100">Net Payable</p>
          <p className="text-sm font-bold mt-0.5">
            ৳ {Number(totalAfterDiscount).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
          <p className="text-[11px] text-amber-100">Paid</p>
          <p className="text-sm font-bold text-emerald-200 mt-0.5">
            ৳ {Number(studentPaid).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
          <p className="text-[11px] text-amber-100">Due</p>
          <p
            className={`text-sm font-bold mt-0.5 ${dueAmount > 0 ? 'text-red-200' : 'text-emerald-300'}`}
          >
            ৳ {Number(dueAmount).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
