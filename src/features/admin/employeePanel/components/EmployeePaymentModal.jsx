import { useState, useEffect } from 'react';
import { useTeacherPaymentAndGenerateInvoiceMutation } from '../../../../../redux/features/teacher/teacherApi';
import { useProcessEmployeePaymentMutation } from '../../../../../redux/features/staff/employeeApi';

export default function EmployeePaymentModal({
  open,
  onClose,
  employee,
  filters,
}) {
  const [loanChecked, setLoanChecked] = useState(false);
  const [payableAmount, setPayableAmount] = useState(0);

  const [processEmployeePayment, { isLoading }] =
    useProcessEmployeePaymentMutation();

  // Base payable = total - paid
  const basePayable =
    Number(employee?.totalAmount || 0) - Number(employee?.paidAmount || 0);

  // Sync modal state
  useEffect(() => {
    if (employee && open) {
      setLoanChecked(false);
      setPayableAmount(basePayable);
    }
  }, [employee, open, basePayable]);

  if (!open || !employee) return null;

  // -------------------------
  // Loan Toggle
  // -------------------------
  const handleLoanToggle = () => {
    const newChecked = !loanChecked;
    setLoanChecked(newChecked);

    const loan = Number(employee?.loanAmount || 0);

    if (newChecked) {
      setPayableAmount(Math.max(basePayable - loan, 0));
    } else {
      setPayableAmount(basePayable);
    }
  };

  // -------------------------
  // Submit Payment
  // -------------------------
  const handleSubmit = async () => {
    try {
      const payload = {
        employeeId: employee?.employeeInfo?._id,
        employeeName: employee?.employeeInfo?.userName,
        phone: employee?.employeeInfo?.phone,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        batch: filters?.batch,
        payableAmount: payableAmount,
        totalAmount: employee?.approvedAmount,
      };

      if (loanChecked) {
        payload.loanAmount = Number(employee?.loanAmount || 0);
      }

      const res = await processEmployeePayment(payload).unwrap();

      if (res) {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);

        alert('Payment completed successfully');
        onClose();
      }
    } catch (err) {
      alert(err?.data?.message || 'Payment failed');
    }
  };

  // -------------------------
  // Helper
  // -------------------------
  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    });

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 capitalize bg-black/40 backdrop-blur-sm font-sans">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">employee Payment</h2>
            <p className="text-xs text-gray-500">
              {filters?.startDate} → {filters?.endDate}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* employee */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">employee</span>
            <span className="text-sm font-medium">
              {employee?.employeeInfo?.userName}
            </span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="font-semibold">
              {formatCurrency(employee?.totalAmount)}
            </span>
          </div>

          {/* Paid */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Paid Amount</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(employee?.paidAmount)}
            </span>
          </div>

          {/* Base Payable */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Unpaid Amount</span>
            <span className="font-semibold text-indigo-600">
              {formatCurrency(basePayable)}
            </span>
          </div>

          {/* Loan Checkbox */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={loanChecked}
                onChange={handleLoanToggle}
                className="w-4 h-4"
              />

              <span className="text-sm">
                Deduct Loan ({formatCurrency(employee?.loanAmount)})
              </span>
            </div>
          </div>

          {/* Payable */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-indigo-50">
            <span className="text-sm font-medium text-indigo-700">
              Payable Amount
            </span>

            <span className="text-lg font-bold text-indigo-700">
              {formatCurrency(payableAmount)}
            </span>
          </div>

          {/* Note */}
          {employee?.finalPaymentNote && (
            <p className="p-2 text-xs text-green-600 rounded bg-green-50">
              {employee?.finalPaymentNote}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            disabled={isLoading || payableAmount <= 0}
            onClick={handleSubmit}
            className="px-5 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
