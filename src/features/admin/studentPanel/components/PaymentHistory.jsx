import { useState } from 'react';
// import { useGetStudentsInvoicesQuery } from '../../../../../redux/features/admin/adminApi';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Printer, Receipt } from 'lucide-react';
import { useGetStudentsInvoicesQuery } from '../services/api/studentInvoiceApi';
import PrintPaymentHistory from './PrintPaymentHistory';

// ─── 10. PAYMENT HISTORY ──────────────────────────────────────────────────────
export default function PaymentHistory() {
  const [open, setOpen] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search] = useState('');
  const [paymentDate] = useState('');
  const [page] = useState(1);
  const [limit] = useState(10);

  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', {
      currency: 'BDT',
      style: 'currency',
    });
  const fmtBDT = (n) => `${fmt(n)}`;

  const { data, isLoading, error, refetch } = useGetStudentsInvoicesQuery({
    search,
    paymentDate,
    page,
    limit,
  });

  const invoices = data?.data || [];
  const onPrint = (inv) => {
    setSelectedInvoice(inv);
    setShowPrintModal(true);
  };

  if (!history.length) return null;

  const cols = [
    'Invoice',
    'Due Before',
    'Paid',
    'Due After',
    'Payment Method',
    'Tnx ID',
    'Payment Date',
    'Received By',
    'Print',
  ];

  return (
    <>
      <div className="overflow-hidden bg-white border rounded shadow-sm border-slate-100">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center gap-2.5 px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 hover:bg-slate-100/60 transition-colors"
        >
          <motion.div
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.18 }}
          >
            <ChevronDown size={13} className="text-slate-400" />
          </motion.div>
          <Receipt size={13} className="text-emerald-500" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
            Payment History
          </span>
          <span className="ml-auto text-[11px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full font-semibold">
            {history?.length}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {cols?.map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-slate-400 font-bold whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices?.map((inv, i) => (
                      <tr
                        key={inv.invoiceNo || i}
                        className="transition-colors border-b border-slate-50 last:border-0 hover:bg-emerald-50/20"
                      >
                        <td className="px-4 py-3 text-slate-400 font-sans text-[11px]">
                          {inv.invoiceNumber || '—'}
                        </td>
                        <td className="px-4 py-3 font-bold font-sans text-emerald-600">
                          {fmtBDT(inv.previousDue || 0)}
                        </td>
                        <td className="px-4 py-3 font-bold font-sans text-emerald-600">
                          {fmtBDT(inv.paidAmount || 0)}
                        </td>
                        <td className="px-4 py-3 font-bold font-sans text-emerald-600">
                          {fmtBDT(inv.finalDue || 0)}
                        </td>
                        <td className="px-4 py-3 uppercase text-slate-600 text-xs">
                          {inv.paymentMethod || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-sans text-[11px]">
                          {inv.transactionId !== 'n/a'
                            ? inv.transactionId
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {inv.paymentDate || inv.createdAt
                            ? new Date(
                                inv.paymentDate || inv.createdAt,
                              ).toLocaleString('en-BD')
                            : '—'}
                        </td>

                        <td className="px-4 py-3 text-slate-500">
                          {inv.createdBy?.name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onPrint(inv)}
                            title="Print Invoice"
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Printer size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showPrintModal && selectedInvoice && (
        <AnimatePresence>
          <PrintPaymentHistory
            showPrintModal={showPrintModal}
            onClose={() => setShowPrintModal(false)}
            invoice={selectedInvoice}
          />
        </AnimatePresence>
      )}
    </>
  );
}
