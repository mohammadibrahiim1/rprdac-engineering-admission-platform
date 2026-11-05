// payment/PaymentForm.jsx

import React, { useEffect } from 'react';
import PaymentSummary from './PaymentSummary';

export default function PaymentForm({
  register,
  errors,
  isEditMode,
  inputCls,
  watch,
  setValue,
}) {
  // Watch all relevant form fields for realtime reactive updates
  const courseFee = Number(watch('courseFee') || 0);
  const admissionFee = Number(watch('admissionFee') || 0);
  const cgpa = Number(watch('cgpa') || 0);
  const studentPaid = Number(watch('studentPaid') || 0);
  const studentReturnAmount = Number(watch('studentReturnAmount') || 0);

  // Core Dynamic Calculation Engine
  useEffect(() => {
    // 1. Reference Discount Calculation: (courseFee - admissionFee)
    const rawRefDiscount =
      courseFee > 0 && admissionFee > 0 ? courseFee - admissionFee : 0;
    const refDiscount = Math.max(0, rawRefDiscount);

    // 2. Gross CGPA Discount Calculation based on Course Fee
    let cgpaDiscountPercentage = 0;
    if (cgpa > 3.89) {
      cgpaDiscountPercentage = 0.25; // 25% Discount (Customizable if needed)
    } else if (cgpa > 3.75) {
      cgpaDiscountPercentage = 0.15; // 15% Discount
    }

    const grossCgpaDiscount = courseFee * cgpaDiscountPercentage;

    // 3. Net CGPA Discount (Gross CGPA Discount minus Reference Discount)
    const netCgpaDiscount = Math.max(0, grossCgpaDiscount - refDiscount);

    // 4. Combined Total Discount
    const totalDiscount = refDiscount + netCgpaDiscount;

    // 5. Total Payable Amount after all discounts applied
    const netPayable = Math.max(0, courseFee - totalDiscount);

    // 6. Effective Base Fee for Due Calculation (Admission Fee - Net CGPA Discount)
    const effectiveFeeToPay = Math.max(0, admissionFee - netCgpaDiscount);

    // 7. Calculate Due & Cashback Status
    const rawDue = effectiveFeeToPay - studentPaid;

    let finalDue = 0;
    let cashback = 0;
    let deductMoney = 0;

    if (rawDue > 0) {
      finalDue = rawDue;
      if (netCgpaDiscount > 0) {
        deductMoney = Math.min(effectiveFeeToPay, netCgpaDiscount);
      }
    } else {
      finalDue = 0;
      // Overpayment or remaining CGPA balance goes to cashback
      cashback = Math.abs(rawDue);
    }

    // 8. Adjust Cashback after deducting returned amount
    const finalCashback = Math.max(0, cashback - studentReturnAmount);

    // Update React Hook Form state seamlessly
    setValue('referenceDiscount', refDiscount, { shouldValidate: true });
    setValue('cgpaDiscount', netCgpaDiscount, { shouldValidate: true });
    setValue('totalAfterDiscount', netPayable, { shouldValidate: true });
    setValue('deductMoney', deductMoney, { shouldValidate: true });
    setValue('dueAmount', finalDue, { shouldValidate: true });
    setValue('studentCashback', finalCashback, { shouldValidate: true });
  }, [
    courseFee,
    admissionFee,
    cgpa,
    studentPaid,
    studentReturnAmount,
    setValue,
  ]);

  // Read calculated fields for display
  const referenceDiscount = Number(watch('referenceDiscount') || 0);
  const cgpaDiscount = Number(watch('cgpaDiscount') || 0);
  const totalDiscount = referenceDiscount + cgpaDiscount;
  const totalAfterDiscount = Number(watch('totalAfterDiscount') || 0);
  const dueAmount = Number(watch('dueAmount') || 0);

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Card */}
      <PaymentSummary
        courseFee={courseFee}
        admissionFee={admissionFee}
        totalDiscount={totalDiscount}
        totalAfterDiscount={totalAfterDiscount}
        studentPaid={studentPaid}
        dueAmount={dueAmount}
      />

      {/* Inputs Form Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CGPA Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Academic CGPA
          </label>
          <input
            {...register('cgpa', { valueAsNumber: true })}
            className={inputCls}
            placeholder="3.90"
            type="number"
            step="0.01"
            min="0"
            max="4.00"
            disabled={!isEditMode}
          />
          {errors.cgpa && (
            <p className="text-xs text-red-500">{errors.cgpa.message}</p>
          )}
        </div>

        {/* Course Fee Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Course Fee (৳)
          </label>
          <input
            {...register('courseFee', { valueAsNumber: true })}
            className={inputCls}
            placeholder="18000"
            type="number"
            disabled={!isEditMode}
          />
          {errors.courseFee && (
            <p className="text-xs text-red-500">{errors.courseFee.message}</p>
          )}
        </div>

        {/* Admission Fee Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Admission Fee (৳)
          </label>
          <input
            {...register('admissionFee', { valueAsNumber: true })}
            className={inputCls}
            placeholder="17000"
            type="number"
            disabled={!isEditMode}
          />
          {errors.admissionFee && (
            <p className="text-xs text-red-500 font-medium">
              {errors.admissionFee.message}
            </p>
          )}
        </div>

        {/* Reference Discount (Calculated Readonly) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Reference Discount (৳)
          </label>
          <input
            {...register('referenceDiscount', { valueAsNumber: true })}
            className={`${inputCls} bg-slate-100 font-semibold text-slate-700 cursor-not-allowed`}
            placeholder="0"
            type="number"
            readOnly
          />
          {errors.referenceDiscount && (
            <p className="text-xs text-red-500">
              {errors.referenceDiscount.message}
            </p>
          )}
        </div>

        {/* CGPA Discount (Calculated Readonly) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            CGPA Discount (৳)
          </label>
          <input
            {...register('cgpaDiscount', { valueAsNumber: true })}
            className={`${inputCls} bg-slate-100 font-semibold text-slate-700 cursor-not-allowed`}
            placeholder="0"
            type="number"
            readOnly
          />
          {errors.cgpaDiscount && (
            <p className="text-xs text-red-500">
              {errors.cgpaDiscount.message}
            </p>
          )}
        </div>

        {/* Deducted Money (Calculated Readonly) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Deducted Amount (৳)
          </label>
          <input
            {...register('deductMoney', { valueAsNumber: true })}
            className={`${inputCls} bg-slate-100 font-semibold text-emerald-700 cursor-not-allowed`}
            placeholder="0"
            type="number"
            readOnly
          />
          {errors.deductMoney && (
            <p className="text-xs text-red-500">{errors.deductMoney.message}</p>
          )}
        </div>

        {/* Total After Discount (Calculated Readonly) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Total After Discount (৳)
          </label>
          <input
            {...register('totalAfterDiscount', { valueAsNumber: true })}
            className={`${inputCls} bg-slate-100 font-bold text-amber-700 cursor-not-allowed`}
            placeholder="0"
            type="number"
            readOnly
          />
          {errors.totalAfterDiscount && (
            <p className="text-xs text-red-500">
              {errors.totalAfterDiscount.message}
            </p>
          )}
        </div>

        {/* Amount Paid Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Amount Paid (৳)
          </label>
          <input
            {...register('studentPaid', { valueAsNumber: true })}
            className={inputCls}
            placeholder="5000"
            type="number"
            disabled={!isEditMode}
          />
          {errors.studentPaid && (
            <p className="text-xs text-red-500">{errors.studentPaid.message}</p>
          )}
        </div>

        {/* Due Amount (Calculated Readonly) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Due Amount (৳)
          </label>
          <input
            {...register('dueAmount', { valueAsNumber: true })}
            className={`${inputCls} bg-slate-100 font-bold text-red-600 cursor-not-allowed`}
            placeholder="0"
            type="number"
            readOnly
          />
          {errors.dueAmount && (
            <p className="text-xs text-red-500">{errors.dueAmount.message}</p>
          )}
        </div>

        {/* Student Cashback (Calculated Readonly) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Cashback (৳)
          </label>
          <input
            {...register('studentCashback', { valueAsNumber: true })}
            className={`${inputCls} bg-slate-100 font-semibold text-emerald-600 cursor-not-allowed`}
            placeholder="0"
            type="number"
            readOnly
          />
          {errors.studentCashback && (
            <p className="text-xs text-red-500">
              {errors.studentCashback.message}
            </p>
          )}
        </div>

        {/* Return Amount Input */}
        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <label className="text-xs font-semibold text-slate-700">
            Return Amount (৳)
          </label>
          <input
            {...register('studentReturnAmount', { valueAsNumber: true })}
            className={inputCls}
            placeholder="0"
            type="number"
            disabled={!isEditMode}
          />
          {errors.studentReturnAmount && (
            <p className="text-xs text-red-500">
              {errors.studentReturnAmount.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
