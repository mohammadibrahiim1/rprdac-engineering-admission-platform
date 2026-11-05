import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Loader2,
  Receipt,
  User,
  Calendar,
  Award,
  Printer,
  Download,
  CheckCircle2,
  FileText,
  ChevronRight,
  Building2,
  Phone,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentPortalData } from '../hooks/studentPortalData';

const StudentInvoice = () => {
  const {
    studentInvoices,
    isInvoiceLoading,
    isInvoiceError,
    invoiceErrorMessage,
    money,
    studentInfo,
    refetchInvoices,
  } = useStudentPortalData();

  // State to hold the currently selected invoice for the right pane
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const invoicePrintRef = useRef(null);

  // Auto-select the first invoice when data loads
  useEffect(() => {
    if (studentInvoices && studentInvoices.length > 0 && !selectedInvoice) {
      setSelectedInvoice(studentInvoices[0]);
    }
  }, [studentInvoices, selectedInvoice]);

  // Handle Print / PDF Download functionality
  const handlePrint = () => {
    const printContent = invoicePrintRef.current;
    if (!printContent) return;

    const windowPrint = window.open('', '', 'width=900,height=650');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Invoice - ${selectedInvoice?.invoiceNumber || 'Details'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-white p-8">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 500);
  };

  return (
    <div className="min-h-screen text-[#37352f] antialiased pb-12">
      {/* Main Responsive Wrapper */}
      <main className="w-full">
        {/* ── Pixel Perfect Modern Premium Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative mb-8 p-6 sm:p-7 bg-gradient-to-br from-[#55004B] via-[#6a0060] to-[#800075] text-white shadow-xl overflow-hidden border border-purple-500/10"
        >
          <div className="absolute top-0 right-0 w-80 h-80 transform translate-x-20 -translate-y-20 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex items-center justify-center text-2xl font-bold text-white border shadow-inner shrink-0 w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border-white/20 select-none">
                🎓
              </div>

              <div>
                <span className="inline-flex items-center text-[10px] font-semibold tracking-wider text-purple-100 uppercase bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/5">
                  Student Portal Dashboard
                </span>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl capitalize">
                  Welcome back, {studentInfo?.name || 'Student'}!
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-purple-100/90">
                  <span className="flex items-center gap-1 bg-black/15 px-2.5 py-1 rounded-lg border border-white/5">
                    <User size={12} className="text-purple-300" />
                    UID:{' '}
                    <span className="text-white font-medium">
                      {studentInfo?.studentUniqueId ||
                        studentInfo?.userId ||
                        'N/A'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 bg-black/15 px-2.5 py-1 rounded-lg border border-white/5">
                    <Award size={12} className="text-purple-300" />
                    Batch:{' '}
                    <span className="text-white font-medium">
                      {studentInfo?.batch || 'N/A'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center self-start lg:self-center px-4 py-2 border shadow-sm bg-white/10 backdrop-blur-md border-white/10 rounded-xl">
              <Calendar size={14} className="text-purple-200 mr-2" />
              <span className="text-xs font-medium text-purple-100/90 mr-1">
                Ledger Sync:
              </span>
              <span className="text-xs font-bold text-white">
                {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── SPLIT LAYOUT: Left Table / Right Preview Details ── */}
        {studentInvoices && studentInvoices?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start px-5">
            {/* LEFT SIDE: Invoice Table List (Span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-[#55004B]" />
                  <h2 className="text-xs font-bold tracking-wider uppercase text-slate-600">
                    Your Invoices ({studentInvoices.length})
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Click any row to view details
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden bg-white border border-slate-200 shadow-sm rounded-xl"
              >
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                      <tr className="text-xs text-slate-500 font-medium select-none">
                        <th className="px-4 py-3 w-10 text-center">#</th>
                        <th className="px-4 py-3">Invoice ID</th>
                        <th className="px-4 py-3">Paid Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Date</th>
                        <th className="px-3 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {studentInvoices?.map((invoice, index) => {
                        const isSelected =
                          selectedInvoice?._id === invoice?._id;
                        return (
                          <motion.tr
                            key={invoice._id || index}
                            onClick={() => setSelectedInvoice(invoice)}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15, delay: index * 0.03 }}
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-50/70 border-l-4 border-l-[#55004B]'
                                : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <td className="px-4 py-3 text-xs text-center font-mono text-slate-400">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-[#55004B]">
                              {invoice.invoiceNumber || `INV-${index + 1}`}
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600">
                              +{money(invoice.paidAmount || invoice.payAmount)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Success
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-slate-500 text-right">
                              {invoice.createdAt
                                ? new Date(
                                    invoice.createdAt,
                                  ).toLocaleDateString('en-GB')
                                : 'N/A'}
                            </td>
                            <td className="px-3 py-3 text-right text-slate-400">
                              <ChevronRight
                                size={14}
                                className={
                                  isSelected
                                    ? 'text-[#55004B] translate-x-0.5'
                                    : ''
                                }
                              />
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* RIGHT SIDE: Full Invoice Receipt Details & Print Preview (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-3 sticky top-20">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#55004B]" />
                  <h2 className="text-xs font-bold tracking-wider uppercase text-slate-600">
                    Invoice Receipt View
                  </h2>
                </div>
                {selectedInvoice && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#55004B] hover:bg-[#6a0060] text-white text-xs font-medium rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Printer size={13} />
                      Print / PDF
                    </button>
                  </div>
                )}
              </div>

              {selectedInvoice ? (
                <motion.div
                  key={selectedInvoice._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-slate-200 shadow-md rounded-md p-6 relative overflow-hidden"
                >
                  {/* Printable Invoice Container */}
                  <div
                    ref={invoicePrintRef}
                    className="bg-white text-slate-800 space-y-6"
                  >
                    {/* Invoice Receipt Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#55004B] text-white flex items-center justify-center font-bold text-sm shadow">
                            🏛️
                          </div>
                          <span className="font-extrabold text-slate-800 tracking-tight text-base">
                            Student Academic Portal
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Official Student Payment Ledger
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-purple-50 text-[#55004B] font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-purple-100">
                          {selectedInvoice.invoiceNumber || 'INV-000'}
                        </span>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          Date:{' '}
                          {selectedInvoice.createdAt
                            ? new Date(
                                selectedInvoice.createdAt,
                              ).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Billed To Section */}
                    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
                      <p className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                        Billed To:
                      </p>
                      <p className="font-bold text-slate-900 text-sm">
                        {studentInfo?.name || 'Student Name'}
                      </p>
                      <p className="text-slate-500">
                        Student ID:{' '}
                        <span className="font-mono font-medium text-slate-700">
                          {studentInfo?.studentId ||
                            studentInfo?.userId ||
                            'N/A'}
                        </span>
                      </p>
                      <p className="text-slate-500">
                        Batch / Program:{' '}
                        <span className="font-medium text-slate-700">
                          {studentInfo?.batch || 'N/A'}
                        </span>
                      </p>
                    </div>

                    {/* Payment Financial Breakdown */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Payment Method</span>
                        <span className="font-semibold text-slate-700 uppercase">
                          {selectedInvoice.paymentMethod || 'Cash'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">
                          Due Before Payment
                        </span>
                        <span className="font-semibold text-slate-700">
                          {money(selectedInvoice.dueAmountBeforePayment)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 bg-emerald-50/50 px-2 rounded">
                        <span className="font-bold text-emerald-800">
                          Paid Amount
                        </span>
                        <span className="font-bold text-emerald-700 text-sm">
                          +
                          {money(
                            selectedInvoice.paidAmount ||
                              selectedInvoice.payAmount,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">
                          Remaining Due After Payment
                        </span>
                        <span className="font-bold text-slate-900">
                          {money(selectedInvoice.dueAmountAfterPayment)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge & Footer Note */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={15} />
                        Verified & Processed
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono text-right">
                        Auth ID:{' '}
                        {selectedInvoice._id?.slice(-6).toUpperCase() ||
                          'SYS-OK'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-md text-center">
                  <Receipt className="text-slate-300 mb-2" size={24} />
                  <p className="text-xs font-medium text-slate-500">
                    Select an invoice from the left list to inspect details.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 border-slate-200 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-3">
              <Receipt className="text-[#55004B]" size={20} />
            </div>
            <p className="text-xs text-slate-400">{invoiceErrorMessage}</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudentInvoice;
