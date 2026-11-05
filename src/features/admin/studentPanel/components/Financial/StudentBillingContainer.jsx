import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  useGetStudentByIdQuery,
  useGetStudentPaymentByStudentIdQuery,
  useUpdateStudentBillingMutation,
} from '../../../../../../redux/features/student/studentApi';

// ─── HELPERS ────────────────────────────────────────────────────────────────

const fmtBDT = (val) => `${Number(val || 0).toLocaleString('en-BD')} ৳`;

// Financial Rate Rule Engine
const cgpaToRate = (cgpa) => {
  const c = parseFloat(cgpa) || 0;
  if (c >= 3.89) return 0.25; // 25%
  if (c >= 3.75 && c <= 3.88) return 0.15; // 15%
  return 0;
};

/**
 * Financial Calculation Engine (Pure Function)
 */
const calcFinancial = ({
  courseFee = 0,
  admissionFee = 0,
  admissionFeePaid = 0,
  messServiceCharge = 0,
  messServiceChargePaid = 0,
  cgpa = 0,
  newPaymentAmount = 0,
  newMessPayment = 0,
  refundedCashback = 0,
}) => {
  const fee = Number(courseFee) || 0;
  const admFee = Number(admissionFee) || 0;
  const admPaid = Number(admissionFeePaid) || 0;
  const messFee = Number(messServiceCharge) || 0;
  const messPaid = Number(messServiceChargePaid) || 0;
  const newPay = Number(newPaymentAmount) || 0;
  const newMessPay = Number(newMessPayment) || 0;
  const returned = Number(refundedCashback) || 0;

  // 1. Reference Discount (courseFee - admissionFee)
  const referenceDiscount = admFee > 0 ? Math.max(0, fee - admFee) : 0;

  // 2. CGPA Discount (Calculated directly on Admission Fee)
  const rate = cgpaToRate(cgpa);
  const rawCgpaDiscount = cgpa ? Math.round(admFee * rate) : 0;

  // 3. Net Discount Rule
  let cgpaDiscount = rawCgpaDiscount;
  let netDiscount = 0;

  if (referenceDiscount >= rawCgpaDiscount) {
    cgpaDiscount = rawCgpaDiscount;
    netDiscount = 0;
  } else {
    netDiscount = rawCgpaDiscount - referenceDiscount;
    cgpaDiscount = rawCgpaDiscount;
  }

  const totalDiscount = referenceDiscount + netDiscount;
  const totalAfterDiscount = Math.max(0, fee - totalDiscount);

  // 4. Paid Totals
  const totalAdmissionPaid = admPaid + newPay;
  const totalMessPaid = messPaid + newMessPay;
  const totalCollected = totalAdmissionPaid + totalMessPaid;

  // 5. Initial Dues (Before applying Net Discount)
  let admissionDue = Math.max(0, admFee - totalAdmissionPaid);
  let messDue = Math.max(0, messFee - totalMessPaid);
  let dueAmount = admissionDue + messDue;

  // 6. Net Discount Deduction against Due & Cashback Allocation
  let deductedFromDue = 0;
  let cashback = 0;

  if (netDiscount > 0) {
    if (netDiscount <= dueAmount) {
      deductedFromDue = netDiscount;
      dueAmount -= netDiscount;

      if (admissionDue >= netDiscount) {
        admissionDue -= netDiscount;
      } else {
        const remaining = netDiscount - admissionDue;
        admissionDue = 0;
        messDue = Math.max(0, messDue - remaining);
      }
    } else {
      deductedFromDue = dueAmount;
      cashback = netDiscount - dueAmount;
      dueAmount = 0;
      admissionDue = 0;
      messDue = 0;
    }
  }

  const activeCashback = Math.max(0, cashback - returned);
  const studentReturnAmount = activeCashback;

  return {
    courseFee: fee,
    admissionFee: admFee,
    messServiceCharge: messFee,

    referenceDiscount,
    cgpaDiscount,
    cgpaRate: rate,
    netDiscount,
    totalDiscount,
    totalAfterDiscount,

    admissionFeePaid: totalAdmissionPaid,
    messServiceChargePaid: totalMessPaid,
    totalCollected,

    admissionDue,
    messDue,
    dueAmount,

    deductedFromDue,
    cashback: activeCashback,
    studentReturnAmount,

    newPaymentAmount: newPay,
    newMessPayment: newMessPay,
  };
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export const StudentBillingContainer = ({ studentId }) => {
  const {
    data: studentRes,
    isLoading: isStudentLoading,
    error: studentError,
  } = useGetStudentByIdQuery(studentId, { skip: !studentId });

  const { data: paymentRes, isLoading: isPaymentLoading } =
    useGetStudentPaymentByStudentIdQuery(studentId, { skip: !studentId });

  const [updateStudentBilling, { isLoading: isUpdating }] =
    useUpdateStudentBillingMutation();

  const [uiFeedback, setUiFeedback] = useState({ success: false, message: '' });

  const student = useMemo(() => studentRes?.data || {}, [studentRes]);
  const payment = useMemo(() => paymentRes?.data || null, [paymentRes]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      courseFee: '',
      admissionFee: '',
      messServiceCharge: '',
      cgpa: '',
      newPaymentAmount: '',
      newMessPayment: '',
      refundedCashback: '',
      paymentMethod: 'cash',
      transactionId: '',
      accountNumber: '',
      note: '',
    },
  });

  // Prefill Form Fields with Existing Database Payment State
  useEffect(() => {
    if (!payment?._id) return;

    reset({
      courseFee: payment.courseFee ?? 18000,
      admissionFee: payment.admissionFee ?? 15000,
      messServiceCharge: payment.messServiceCharge ?? 1300,
      cgpa: payment.cgpa ?? '',
      newPaymentAmount: '',
      newMessPayment: '',
      refundedCashback: '',
      paymentMethod: payment.paymentMethod || 'cash',
      transactionId: '',
      accountNumber: '',
      note: '',
    });
  }, [payment, reset]);

  const watched = useWatch({ control });

  // Real-time Calculation Sync (মেস চার্জ সহ লাইভ হিসাব)
  const live = useMemo(
    () =>
      calcFinancial({
        courseFee: watched.courseFee ?? payment?.courseFee ?? 0,
        admissionFee: watched.admissionFee ?? payment?.admissionFee ?? 0,
        messServiceCharge:
          watched.messServiceCharge ?? payment?.messServiceCharge ?? 0, // <-- LIVE INPUT
        admissionFeePaid: payment?.admissionFeePaid || 0,
        messServiceChargePaid: payment?.messServiceChargePaid || 0,
        cgpa: watched.cgpa !== '' ? watched.cgpa : payment?.cgpa || 0,
        newPaymentAmount: watched.newPaymentAmount || 0,
        newMessPayment: watched.newMessPayment || 0,
        refundedCashback: watched.refundedCashback || 0,
      }),
    [watched, payment],
  );

  const onSubmit = async (data) => {
    setUiFeedback({ success: false, message: '' });

    const payload = {
      courseFee: Number(data.courseFee) || 0,
      admissionFee: Number(data.admissionFee) || 0,
      messServiceCharge: Number(data.messServiceCharge) || 0, // <-- BACKEND E PATHANO HOLO
      cgpa: data.cgpa ? Number(data.cgpa) : null,

      newPaymentAmount: Number(data.newPaymentAmount) || 0,
      newMessPayment: Number(data.newMessPayment) || 0,
      refundedCashback: Number(data.refundedCashback) || 0,

      paymentMethod: data.paymentMethod || 'cash',
      transactionId:
        data.paymentMethod !== 'cash' ? data.transactionId || null : null,
      accountNumber:
        data.paymentMethod !== 'cash' ? data.accountNumber || null : null,
      note: data.note || 'Updated via Billing Console',

      referenceDiscount: live.referenceDiscount,
      cgpaDiscount: live.cgpaDiscount,
      cgpaRate: live.cgpaRate,
      netDiscount: live.netDiscount,
      totalDiscount: live.totalDiscount,
      totalAfterDiscount: live.totalAfterDiscount,

      dueAmount: live.dueAmount,
      admissionFeeDue: live.admissionDue,
      messServiceChargeDue: live.messDue,

      deductMoney: live.deductedFromDue,
      cashback: live.cashback,
      studentReturnAmount: live.studentReturnAmount,
      totalPaidToDate: live.totalCollected,
    };

    try {
      const result = await updateStudentBilling({
        id: studentId,
        billingData: payload,
      }).unwrap();

      setUiFeedback({
        success: true,
        message: `Payment updated successfully. Invoice: ${
          result?.invoice?.invoiceNumber || payment?.invoiceNo || 'GENERATED'
        }`,
      });

      reset((prev) => ({
        ...prev,
        newPaymentAmount: '',
        newMessPayment: '',
        refundedCashback: '',
        transactionId: '',
        accountNumber: '',
        note: '',
      }));
    } catch (err) {
      setUiFeedback({
        success: false,
        message: err?.data?.message || 'Failed to update billing details.',
      });
    }
  };

  if (isStudentLoading || isPaymentLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="w-8 h-8 mb-3 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Loading financial profile...</p>
      </div>
    );
  }

  if (studentError) {
    return (
      <div className="p-4 mx-auto my-10 max-w-xl text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
        Unable to load student payment record.
      </div>
    );
  }

  const studentName =
    typeof student?.name === 'object'
      ? `${student.name.firstName || ''} ${student.name.lastName || ''}`.trim()
      : student?.name || 'Student';

  // Structured Grid Display Data Mapping
  const summaryMetrics = [
    // 1. BASE FEES & STANDARDS
    {
      label: 'Course Fee',
      value: fmtBDT(live.courseFee),
      bg: 'bg-slate-50',
      text: 'text-slate-800',
    },
    {
      label: 'Ref. Discount',
      value: fmtBDT(live.referenceDiscount),
      bg: 'bg-slate-50',
      text: 'text-slate-600',
    },
    {
      label: 'Admission Fee',
      value: fmtBDT(live.admissionFee),
      bg: 'bg-slate-50',
      text: 'text-slate-800',
    },

    // 2. CGPA & NET DISCOUNT ENGINE
    {
      label: 'CGPA Rate',
      value: live.cgpaRate
        ? `${watched.cgpa || payment?.cgpa || 0} (${(live.cgpaRate * 100).toFixed(0)}%)`
        : watched.cgpa || payment?.cgpa || '—',
      bg: 'bg-violet-50',
      text: 'text-violet-700',
    },
    {
      label: 'CGPA Discount',
      value: fmtBDT(live.cgpaDiscount),
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
    {
      label: 'Net Discount',
      value: fmtBDT(live.netDiscount),
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
    },
    {
      label: 'After Discount',
      value: fmtBDT(live.totalAfterDiscount),
      bg: 'bg-indigo-50',
      text: 'text-indigo-800 font-semibold',
    },

    // 3. OTHER CHARGES
    {
      label: 'Mess Charge',
      value: fmtBDT(live.messServiceCharge),
      bg: 'bg-amber-50',
      text: 'text-amber-800',
    },

    // 4. COLLECTION / PAID AMOUNTS
    {
      label: 'Admission Paid',
      value: fmtBDT(live.admissionFeePaid),
      bg: 'bg-sky-50',
      text: 'text-sky-600',
    },
    {
      label: 'Mess Paid',
      value: fmtBDT(live.messServiceChargePaid),
      bg: 'bg-sky-50',
      text: 'text-sky-600',
    },
    {
      label: 'Total Collected',
      value: fmtBDT(live.totalCollected),
      bg: 'bg-sky-100',
      text: 'text-sky-800 font-semibold',
    },

    // 5. OUTSTANDING DUES
    {
      label: 'Admission Due',
      value: fmtBDT(live.admissionDue),
      bg: 'bg-rose-50',
      text: 'text-rose-600',
    },
    {
      label: 'Mess Due',
      value: fmtBDT(live.messDue),
      bg: 'bg-rose-50',
      text: 'text-rose-600',
    },
    {
      label: 'Total Due Amount',
      value: fmtBDT(live.dueAmount),
      bg: 'bg-rose-100',
      text: 'text-rose-800 font-semibold',
    },

    // 6. CASHBACK & REFUNDS
    {
      label: 'Cashback',
      value: fmtBDT(live.cashback),
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      label: 'Returned',
      value: fmtBDT(live.studentReturnAmount),
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto my-6 px-4 space-y-6 font-sans text-slate-800">
      {/* Identity Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          {studentName}
        </h1>
        <span className="text-slate-300">|</span>
        <span className="text-sm font-mono text-slate-600">
          ID: {payment?.studentId || 'N/A'}
        </span>
        {payment?.invoiceNo && (
          <>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-mono text-slate-400">
              Inv: {payment.invoiceNo}
            </span>
          </>
        )}
        {payment?.paymentStatus && (
          <span
            className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full border ${
              payment.paymentStatus === 'paid'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : payment.paymentStatus === 'partial'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {payment.paymentStatus.toUpperCase()}
          </span>
        )}
      </div>

      {/* Summary + Live Calculation Panel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Payment Summary + Live Calculation
          </span>
          <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Real-time Sync Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          {summaryMetrics?.map((item, idx) => (
            <div
              key={idx}
              className={`px-4 py-3 border-b border-r border-slate-100 transition-colors ${item.bg}`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {item.label}
              </div>
              <div
                className={`text-sm font-bold font-mono tabular-nums ${item.text}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Entry Form */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-900">
            Update Payment & Rates
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Course Fee
              </label>
              <input
                type="number"
                step="any"
                {...register('courseFee', { required: 'Required' })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.courseFee && (
                <span className="text-[10px] text-rose-500">
                  {errors.courseFee.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Admission Fee
              </label>
              <input
                type="number"
                step="any"
                {...register('admissionFee', { required: 'Required' })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mess Service Charge
              </label>
              <input
                type="number"
                step="any"
                {...register('messServiceCharge', { required: 'Required' })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                CGPA (Live Discount)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="e.g. 3.92"
                {...register('cgpa')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                &gt;3.89 → 25% | 3.75-3.88 → 15% (on Admission Fee)
              </p>
            </div>
          </div>

          <hr className="border-dashed border-slate-200" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Collect Admission Payment
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                {...register('newPaymentAmount')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Collect Mess Payment
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                {...register('newMessPayment')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Return Cashback
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                {...register('refundedCashback')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {(Number(watched.newPaymentAmount) > 0 ||
            Number(watched.newMessPayment) > 0) && (
            <div className="p-4 space-y-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Payment Method
                </label>
                <select
                  {...register('paymentMethod')}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="bank">Bank</option>
                </select>
              </div>

              {watched.paymentMethod !== 'cash' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      {...register('transactionId', {
                        required:
                          watched.paymentMethod !== 'cash' ? 'Required' : false,
                      })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      {...register('accountNumber', {
                        required:
                          watched.paymentMethod !== 'cash' ? 'Required' : false,
                      })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Note
            </label>
            <textarea
              rows={2}
              {...register('note')}
              placeholder="Internal operational note..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className={`w-full py-3 rounded-lg text-sm font-semibold text-white transition-all ${
              isUpdating
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isUpdating ? 'Updating Records...' : 'Save & Update Billing'}
          </button>
        </form>

        {uiFeedback.message && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-medium border flex items-center justify-between ${
              uiFeedback.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>{uiFeedback.message}</span>
            <button
              type="button"
              onClick={() => setUiFeedback({ success: false, message: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Payment Audit Logs & History */}
      {payment?.paymentHistory?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audit & Payment History
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {[...payment.paymentHistory].reverse().map((item, idx) => (
              <div
                key={item._id || idx}
                className="px-5 py-3 hover:bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {item.actionType?.replaceAll('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-GB')
                      : '—'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-1">{item.message}</p>
                <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-500">
                  <span>
                    Collected:{' '}
                    <strong className="text-slate-700">
                      {fmtBDT(item.totalCollected)}
                    </strong>
                  </span>
                  <span className="capitalize">
                    Method: <strong>{item.paymentMethod || '—'}</strong>
                  </span>
                  {item.invoiceNo && (
                    <span>
                      Invoice: <strong>{item.invoiceNo}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
